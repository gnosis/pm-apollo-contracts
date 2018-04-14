# Gnosis Olympia Contracts

This is a collection of contracts related to specifically to Gnosis Olympia. These contracts can be used in setting up prediction market tournaments.

This is the Olympia token contract implementation:
  - Rinkeby:
    - Address: `0x979861df79c7408553aaf20c01cfb3f81ccf9341`
    - Creator: `0xcAb5bb0408C48780D38C452bE20E30da1A10e656`

The mainnet address registry can be found:
  - Rinkeby:
    - Address: `0x6427d856450b20f6fab88be18d949faf9c4da512`
    - Creator: `0xcAb5bb0408C48780D38C452bE20E30da1A10e656`

# Contracts Overview

## PlayToken

Beyond the bare minimum necessary to implement the ERC20 interface sanely, this contract also implements two other mechanics: issuing new tokens to addresses, and determining a whitelist for token transfers.

The ability to issue new tokens to addresses, or minting tokens, is restricted to the creator of the contract instance. This action can be performed with a call to the `issue` function, which takes an array of recipient addresses and credits them a newly minted amount of token. The token issuance may, for example, be tied into a registration process for an event.

The creator of the contract instance is also required to specify accounts which will be administrators of this contract. The creator and these administrators are, in turn, required to specify a whitelist for token transfers. This prevents arbitrary transfers of token value from one account to another. PlayTokens can be transferred only to or from the whitelisted addresses. You may use this mechanic to ensure that users can only perform transactions with the token on authorized contracts in an event.

## OlympiaToken

Same as the PlayToken, except the optional [ERC20](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md) fields `name`, `symbol`, and `decimals` have also been specified.

## AddressRegistry

A registry of mainnet addresses for tournaments which run on a testnet like Rinkeby.

## RewardClaimHandler

A contract which stores rewards for winners, allowing them to claim the rewards by a deadline.

# Redeploying the Contracts

See [this deployment guide](https://gnosis.github.io/lil-box/deployment-guide.html). You will need to execute `npm run truffle migrate -- --reset --network rinkeby` with the `--reset` flag.

# Issue tokens

You can use the following script to have each address in a list issued 10^18 units of PlayToken:

```sh
truffle exec scripts/issue_tokens.js --network=rinkeby --amount 1e18 --to <comma separated addresses>
```

Both the `amount` and the list of addresses are adjustable.
