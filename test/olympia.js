const OlympiaToken = artifacts.require('OlympiaToken')
const AddressRegistry = artifacts.require('AddressRegistry')

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
