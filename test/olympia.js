const OlympiaToken = artifacts.require('OlympiaToken')

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
