'use strict'

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
    let rewardToken, rewardClaimHandler
    let operator, randomWhale, winners, rewardAmounts, totalAmountRewarded

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

    it('should not allow anyone to register rewards with not enough allowance or bad input', async () => {
        await rewardToken.approve(rewardClaimHandler.address, totalAmountRewarded / 10, { from: operator })
        await throwUnlessRejects(rewardClaimHandler.registerRewards(winners, rewardAmounts, { from: operator }))
        await rewardToken.approve(rewardClaimHandler.address, totalAmountRewarded, { from: operator })
        await throwUnlessRejects(rewardClaimHandler.registerRewards(winners.slice(1), rewardAmounts, { from: operator }))
    })

    it('should only allow operator to register rewards', async () => {
        await rewardToken.approve(rewardClaimHandler.address, totalAmountRewarded, { from: randomWhale })
        await throwUnlessRejects(rewardClaimHandler.registerRewards(winners, rewardAmounts, { from: randomWhale }))
    })

    it('should allow operator to register rewards with contract', async () => {
        const balanceBefore = await rewardToken.balanceOf(operator)
        await rewardClaimHandler.registerRewards(winners, rewardAmounts, { from: operator })
        const balanceAfter = await rewardToken.balanceOf(operator)
        assert.equal(balanceBefore.sub(balanceAfter).valueOf(), totalAmountRewarded);

        (await Promise.all(winners.map((w, i) => rewardClaimHandler.winners(i)))).forEach((winnerOnChain, i) =>
            assert.equal(winnerOnChain, winners[i]))
    })

    it('should prevent operator from registering rewards while registered rewards still exist', async () => {
        await rewardToken.approve(rewardClaimHandler.address, totalAmountRewarded, { from: operator })
        await throwUnlessRejects(rewardClaimHandler.registerRewards(winners, rewardAmounts, { from: operator }))
    })

    it('should allow winners to receive rewards', async () => {
        const claimantIndices = [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 13, 34, 52]
        const claimants = claimantIndices.map(i => winners[i])
        const claimedRewards = claimantIndices.map(i => rewardAmounts[i])
        const totalRewardsClaimed = claimedRewards.reduce((a, b) => a + b)
        await Promise.all(claimants.map(claimant => rewardClaimHandler.claimReward({ from: claimant })));
    })
})