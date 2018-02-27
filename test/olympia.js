'use strict'

const util = require('util')

const _ = require('lodash')
const { wait } = require('@digix/tempo')(web3);

const OlympiaToken = artifacts.require('OlympiaToken')
const AddressRegistry = artifacts.require('AddressRegistry')
const RewardClaimHandler = artifacts.require('RewardClaimHandler')
const RewardToken = artifacts.require('RewardToken')
RewardToken.link(artifacts.require('Math'))

async function throwUnlessRejects(q) {
    let res
    try {
        res = await q
    } catch(e) {
        return e
    }
    throw new Error(`got result ${ res } from ${ q }`)
}

const getBlock = util.promisify(web3.eth.getBlock.bind(web3.eth))

contract('OlympiaToken', function(accounts) {
    let olympiaToken

    before(async () => {
        olympiaToken = await OlympiaToken.deployed()
    })

    it('should have the right name, symbol, and decimals', async () => {
        assert.equal(await olympiaToken.name(), 'Olympia Token')
        assert.equal(await olympiaToken.symbol(), 'OLY')
        assert.equal(await olympiaToken.decimals(), 18)
    })

    it('should allow the contract creator to issue tokens', async () => {
        const [creator, ...recipients] = accounts

        assert.equal(await olympiaToken.creator(), creator)
        assert.equal(await olympiaToken.totalSupply(), 0)

        const startingBalances = (await Promise.all(recipients.map((r) => olympiaToken.balanceOf(r)))).map((v) => v.valueOf())
        startingBalances.forEach((b, i) => assert.equal(b, 0, `recipient ${recipients[i]} balance`))

        await olympiaToken.issue(recipients, 1e18)

        const endingBalances =  (await Promise.all(recipients.map((r) => olympiaToken.balanceOf(r)))).map((v) => v.valueOf())
        endingBalances.forEach((b, i) => assert.equal(b, 1e18, `recipient ${recipients[i]} balance`))

        assert.equal(await olympiaToken.totalSupply(), 1e18 * recipients.length)
    })
})

contract('AddressRegistry', function(accounts) {
    let addressRegistry

    before(async () => {
        addressRegistry = await AddressRegistry.deployed()
    })

    it('should begin with no registered addresses', async () => {
        (await Promise.all(accounts.map(account => addressRegistry.mainnetAddressFor(account))))
        .forEach(registeredMainnetAddress => {
            assert.equal(registeredMainnetAddress, '0x0000000000000000000000000000000000000000')
        })
    })

    it('should register addresses', async () => {
        const addressForIndex = i => `0xcafebabedeadbeefc0ffee67ea1ceb00dabad${
            ('000' + i).substring(('' + i).length)
        }`

        const txResults = await Promise.all(accounts.map((account, i) => {
            return addressRegistry.register(addressForIndex(i), { from: account })
        }))
        
        txResults.forEach((txResult, i) => {
            assert.equal(txResult.logs.length, 1)
            assert.equal(txResult.logs[0].event, 'AddressRegistration')
            assert.equal(txResult.logs[0].args.registrant, accounts[i])
            assert.equal(txResult.logs[0].args.registeredMainnetAddress, addressForIndex(i))
        });

        (await Promise.all(accounts.map(account => addressRegistry.mainnetAddressFor(account))))
        .forEach((registeredMainnetAddress, i) => {
            assert.equal(registeredMainnetAddress, addressForIndex(i))
        })
    })
})

contract('RewardClaimHandler', function(accounts) {
    const rewardClaimDuration = 3600000
    let rewardToken, rewardClaimHandler
    let operator, randomWhale, winners, rewardAmounts, totalAmountRewarded, totalRewardsClaimed, startTime

    before(async () => {
        rewardToken = await RewardToken.new()
        rewardClaimHandler = await RewardClaimHandler.new(rewardToken.address)

        operator = accounts[0]
        winners = accounts.slice(1, 101)
        randomWhale = accounts[101]
        rewardAmounts = winners.map((winner, i) => i < 10 ? (10 - i) * 1e18 : 1e17)
        totalAmountRewarded = rewardAmounts.reduce((a, b) => a + b)

        await rewardToken.transfer(randomWhale, totalAmountRewarded * 2, { from: operator })

        assert((await rewardToken.balanceOf(operator)).gt(totalAmountRewarded) &&
            (await Promise.all(winners.map(winner => rewardToken.balanceOf(winner))))
                .every(balance => balance.eq(0)))
    })

    for(let whichRun = 0; whichRun < 2; whichRun++) {
        const caseDescriptionPrefix = whichRun === 0 ? '' : 'after a complete run '
        it(caseDescriptionPrefix + 'should not allow anyone to register rewards with not enough allowance or bad input', async () => {
            await rewardToken.approve(rewardClaimHandler.address, totalAmountRewarded / 10, { from: operator })
            await throwUnlessRejects(rewardClaimHandler.registerRewards(winners, rewardAmounts, rewardClaimDuration, { from: operator }))
            await rewardToken.approve(rewardClaimHandler.address, totalAmountRewarded, { from: operator })
            await throwUnlessRejects(rewardClaimHandler.registerRewards(winners.slice(1), rewardAmounts, rewardClaimDuration, { from: operator }))
        })

        it(caseDescriptionPrefix + 'should only allow operator to register rewards', async () => {
            await rewardToken.approve(rewardClaimHandler.address, totalAmountRewarded, { from: randomWhale })
            await throwUnlessRejects(rewardClaimHandler.registerRewards(winners, rewardAmounts, rewardClaimDuration, { from: randomWhale }))
        })

        it(caseDescriptionPrefix + 'should allow operator to register rewards with contract', async () => {
            const balanceBefore = await rewardToken.balanceOf(operator)
            startTime = (await getBlock(
                (await rewardClaimHandler.registerRewards(winners, rewardAmounts, rewardClaimDuration, { from: operator }))
                    .receipt.blockNumber)).timestamp
            const balanceAfter = await rewardToken.balanceOf(operator)
            assert.equal(balanceBefore.sub(balanceAfter).valueOf(), totalAmountRewarded);

            (await Promise.all(winners.map((w, i) => rewardClaimHandler.winners(i)))).forEach((winnerOnChain, i) =>
                assert.equal(winnerOnChain, winners[i]));
            (await Promise.all(winners.map(winner => rewardClaimHandler.rewardAmounts(winner)))).forEach((reward, i) =>
                assert.equal(reward.valueOf(), rewardAmounts[i]))
        })

        it(caseDescriptionPrefix + 'should prevent operator from registering rewards while registered rewards still exist', async () => {
            await rewardToken.approve(rewardClaimHandler.address, totalAmountRewarded, { from: operator })
            await throwUnlessRejects(rewardClaimHandler.registerRewards(winners, rewardAmounts, rewardClaimDuration, { from: operator }))
        })

        it(caseDescriptionPrefix + 'should allow winners to receive rewards', async () => {
            const claimantIndices = _.sampleSize(_.range(winners.length), (.9 * winners.length) | 0)
            const claimants = claimantIndices.map(i => winners[i])
            const claimedRewards = claimantIndices.map(i => rewardAmounts[i])
            totalRewardsClaimed = claimedRewards.reduce((a, b) => a + b)

            const rchBalanceBefore = await rewardToken.balanceOf(rewardClaimHandler.address)
            const balancesBefore = await Promise.all(claimants.map(claimant => rewardToken.balanceOf(claimant)))

            await Promise.all(claimants.map(claimant => rewardClaimHandler.claimReward({ from: claimant })));

            (await Promise.all(claimants.map(claimant => rewardClaimHandler.rewardAmounts(claimant)))).forEach(reward =>
                assert.equal(reward.valueOf(), 0))

            const rchBalanceAfter = await rewardToken.balanceOf(rewardClaimHandler.address)
            const balancesAfter = await Promise.all(claimants.map(claimant => rewardToken.balanceOf(claimant)))

            _.zip(claimantIndices, claimants, claimedRewards, balancesBefore, balancesAfter).map(([i, claimant, reward, balBefore, balAfter]) => {
                assert.equal(balAfter.sub(balBefore).valueOf(), reward, `Reward for claimant ${ i } is incorrect`)
            })
            assert.equal(rchBalanceBefore.sub(rchBalanceAfter).valueOf(), totalRewardsClaimed)
        })

        it(caseDescriptionPrefix + 'should forbid operator from retracting rewards before time limit for claims passes', async () => {
            assert((await getBlock('pending')).timestamp < (await rewardClaimHandler.guaranteedClaimEndTime()).valueOf())
            await throwUnlessRejects(rewardClaimHandler.retractRewards({ from: operator }))
        })

        it(caseDescriptionPrefix + 'should allow only operator to retract rewards after time limit for claims has passed, after which rewards can no longer be claimed', async () => {
            const unclaimedRewards = totalAmountRewarded - totalRewardsClaimed
            const waitTime = ((await getBlock('pending')).timestamp) + rewardClaimDuration - startTime
            assert(waitTime > 0)
            await wait(waitTime)
            await throwUnlessRejects(rewardClaimHandler.retractRewards({ from: randomWhale }))

            const opBalanceBefore = await rewardToken.balanceOf(operator)
            const rchBalanceBefore = await rewardToken.balanceOf(rewardClaimHandler.address)
            await rewardClaimHandler.retractRewards({ from: operator })
            const opBalanceAfter = await rewardToken.balanceOf(operator)
            const rchBalanceAfter = await rewardToken.balanceOf(rewardClaimHandler.address)

            assert.equal(opBalanceAfter.sub(opBalanceBefore).valueOf(), unclaimedRewards)
            assert.equal(rchBalanceBefore.sub(rchBalanceAfter).valueOf(), unclaimedRewards);
            (await Promise.all(winners.map(winner => rewardClaimHandler.rewardAmounts(winner)))).forEach((reward) =>
                assert.equal(reward.valueOf(), 0))

            await Promise.all(winners.map(winner => throwUnlessRejects(rewardClaimHandler.claimReward({ from: winner }))));
        })
    }
})
