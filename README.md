# Gnosis Apollo Contracts

This is a collection of contracts related to specifically to Gnosis Apollo. These contracts can be used in setting up prediction market tournaments like Olympia.

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

# Operations Overview

## Redeploying the Contracts

See [this deployment guide](https://gnosis.github.io/lil-box/deployment-guide.html). You will need to execute `npm run migrate -- --reset --network rinkeby` with the `--reset` flag.

## Designating Admins

Administrator accounts can whitelist addresses for token addresses, as discussed above in the [PlayToken](#playtoken) section. These administrator accounts may be designated during migration by supplying them comma-separated to an `--admins` option:

```js
npm run migrate -- --reset --network rinkeby --admins=<comma separated addresses>
```

They may also be provided after deployment by the deployer with the following script:

```sh
npm run add-admin -- --addresses=<comma separated addresses>
```

The deployer may also remove admins with the following script:

```sh
npm run remove-admin -- --addresses=<comma separated addresses>
```

## Transfer Whitelist Management

The deployer and administrators can use the following script to allow transfers on a set of provided addresses:

```sh
npm run allow-transfers -- --addresses=<comma separated addresses>
```

They can similarly revoke arbitrary transfer capabilities with the following:

```sh
npm run disallow-transfers -- --addresses=<comma separated addresses>
```

## Issue tokens

The deployer can use the following script to have each address in a list issued PlayToken:

```sh
npm run issue-tokens -- --amount <units of token> --to <comma separated addresses>
```

The `--amount` is expressed "in wei," or in the smallest units of the token. Thus, for most tokens, which have a `decimals` value of 18, one whole token would be expressed as `1e18` (scientific notation) of that token, e.g. `1e18 wei == 1 ether`.

## Deploy reward claim handler

Every tournament use to have a reward for the winners as a reward token, in the case of Olympia, this token was GNO. In order to automate the reward claiming, we developed a contract to manage it, you can deploy it with:
```sh
npx truffle exec scripts/deploy_reward_contract.js --token=<token-address> --network=mainnet
```

## `--from` and `--network`

The `add-admin`, `remove-admin`, `allow-transfers`, `disallow-transfers`, and `issue-tokens` tokens also support `--from`, `--network`, and `--play-token-name` options (be sure to specify these after the first bare `--`).

The `--from <account>` specifies an account with which to do the transaction.

If you have deployments on multiple networks, you can specify the network you mean the script to interact with via the `--network <network name>` option.

Finally, if you have happened to rename the PlayToken from OlympiaToken to something else, you can specify that name via the `--play-token-name <new case-sensitive name>` option.