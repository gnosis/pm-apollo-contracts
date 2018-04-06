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

# Deployment to a Public Network

The original Olympia was conducted primarily on the [Rinkeby test network](https://www.rinkeby.io/), but the Gnosis core contracts are deployed on the other major testnets such as the Kovan and Ropsten networks. Since the other components of the stack are network-agnostic, we can deploy to any testnet we choose. This section will create a fresh deployment of the Olympia contracts, which is necessary for running a new tournament, for example. For the purpose of this guide, we will be using Rinkeby, but the following discussion applies to any other network.

```sh
git clone https://github.com/gnosis/olympia-token
cd olympia-token
```

In the root directory of the `olympia-token` repository, create a new file called `truffle-local.js`. Note that this file is listed in `.gitignore` and `.npmignore`, meaning that this file will not be published by NPM, and this file will not be included in source control. Confirm that Git does not see this file:

```
$ git status
On branch master
Your branch is up to date with 'origin/master'.

nothing to commit, working tree clean
```

## Make an HD Wallet for the Deployment

[`truffle-hdwallet-provider`](https://github.com/trufflesuite/truffle-hdwallet-provider) should be installed locally in this repository as a result of the previous invocation of `npm i`. This allows one to use a 12-word BIP39 mnemonic to derive a keypair and its associated Ethereum address for use on the network.

Need one on the fly? One trick to get one is to run Ganache CLI for a moment and quit it with Ctrl+C:

```
$ ./node_modules/.bin/ganache-cli # I am running the local copy here, but you can use a global instance if you have one
Ganache CLI v6.0.3 (ganache-core: 2.0.2)

Available Accounts
==================
(0) 0xae2e104a271b96bee7fe31a7b687ddf48d120356
(1) 0x0e9d59b93a926c69e27c1077922c5e7209ad394b
(2) 0xf7f92f008fc87904187848f974bf0098c12c47fe
(3) 0x3214ad4c80c811b70bc1b353629db600af9fb2d4
(4) 0xb88c372207ee6c9327172af708ab39a9245a8039
(5) 0xbb647223aeca95fe1136fc9f48d49f71362fe448
(6) 0xe4052566e33bdbc4ec064849c7f0e0261256af9f
(7) 0x8c21c0d69a6abfcea2622808fc531cdba35055cc
(8) 0xd37b370fd6d587e8e55291b3ad10356e0e65a68e
(9) 0x16bb5d6be20591cd195aa8f2a095ec0487097dcc

Private Keys
==================
(0) 9aa38d11d23c7b940a7b2e0c58062a523790544b7cfb9263dff29afa019b92cd
(1) 6e88319718d77b2f68bfd5f1c188e46376b570b183c38e6768404b92d8b996eb
(2) 93b082f3270e81f135b8e61a8a38d0a6169e3a03131ebe01f4f81ef65b3a2aa7
(3) deae1e8979887b63695e859314512b6ce5860fe6711ea336f0fe5d78daa2e6be
(4) df86e8b58835d5cf89c63b0a9a53b2daa2a7935b40aacaddf460741e62214948
(5) 1ee2d31adad0e339897fe8d7cd4a40114897d23695e9ad9bd524f7838bc79318
(6) eb354ca869dcbc18bfffe07a2ed2ed0729037f1fd6f70e13e5d304b499fe9215
(7) 462d24f7e3bba9bd0359de079d520acd60e292b3d79003294b90dc7322b82157
(8) f9bac61df108a401dc43962c2b4bc57cfab78967e75715f1730662c425c9f08d
(9) 1e46ba6f2a2f59a588546de65372c9de89771934ec20927b26d47027c6089e4f

HD Wallet
==================
Mnemonic:      romance spirit scissors guard buddy rough cabin paddle cricket cactus clock buddy
Base HD Path:  m/44'/60'/0'/0/{account_index}

Listening on localhost:8545
```

Take note of the list of addresses and the mnemonic, which in this instance is `romance spirit scissors guard buddy rough cabin paddle cricket cactus clock buddy`. Don't use the same mnemonic! This is supposed to be a secret.

Go ahead and put the following in `truffle-local.js`:

```js
const HDWalletProvider = require('truffle-hdwallet-provider')

const mnemonic = 'romance spirit scissors guard buddy rough cabin paddle cricket cactus clock buddy'
const infuraAccessKey = ''
const accountIndex = 7

module.exports = {
    networks: {
        rinkeby: {
            provider: new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/${ infuraAccessKey }`, accountIndex)
        }
    }
}
```

The account used for the deployment will be associated with the `mnemonic` and the `accountIndex` specified above (note that this index is 7 in this example). Therefore, the address which does the deployment in this example will be `0x8c21c0d69a6abfcea2622808fc531cdba35055cc`.

Also note that we will, for the purposes of this guide, be relying on the infrastructure provided by [INFURA](https://infura.io). You may sign up and get an INFURA access key for free if you'd like.

## Sending Deployment Transactions via Truffle

Run `npm run compile` to check that there aren't any basic scripting errors that have been introduced while writing `truffle-local.js`.

Then run `npm run migrate -- --network rinkeby` to deploy the contracts using the scripts in the `migrations` folder. You may run `npm run migrate -- --network rinkeby --admins=address1,...,addressN` (multiple comma separated addresses) instead to deploy the contracts with admins.

Assuming you haven't funded your account with test ether yet, you will probably get an error like the following:

```text
> truffle migrate "--network" "rinkeby"

Using network 'rinkeby'.

Running migration: 1_initial_migration.js
  Deploying Migrations...
Error encountered, bailing. Network state unknown. Review successful transactions manually.
insufficient funds for gas * price + value
```

If you're following along with this guide, go ahead and [get some Rinkeby test ether](https://www.rinkeby.io/#faucet) for your account. Then try running `npm run migrate -- --network rinkeby` again. This will take a couple of minutes.

If you see something like the following in your terminal:

```text
> truffle migrate "--network" "rinkeby"

Using network 'rinkeby'.

Running migration: 1_initial_migration.js
  Deploying Migrations...
  ... 0x039e0454560f81b6373233e84e5dc5a4e6351277a85cc8767ddfb5f88cd5c3d8
  Migrations: 0x4822ea9c767071bab1f89cbeaf82d667d6bbc0c4
Saving successful migration to network...
  ... 0x1f7e4d2dbf3eed09d3a177f58dd17c5d08f0a069ab94428e0105191231f50958
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Deploying Math...
  ... 0xe7c54c4f717b9af2c55ab776c2c39ba8ec330802a63156986f4a52add272f02f
  Math: 0x42384e04beb1d2946c416f96bbd2e9f4fb4684b2
  Linking Math to OlympiaToken
  Deploying OlympiaToken...
  ... 0x06230721f6f061c1c08ab35aa111c4a87a5a47f3d40ca957f87b570abf400d96
  OlympiaToken: 0xff730e9a89f39fe662c63086c986edae696f61b9
Saving successful migration to network...
  ... 0xf04ef84a08ad3f5e2c4b32c9789a61fc3ec68309f264df77d340b8472be1fcf5
Saving artifacts...
Running migration: 3_deploy_address_registry.js
  Deploying AddressRegistry...
  ... 0x2971a6e9f611b5cae5b7c0687402156b044993af8f1be58789b05999a5ade910
  AddressRegistry: 0xb36e4d8b39c2bf89ba4b76bf2a952656c40fdf1f
Saving successful migration to network...
  ... 0xbc552bee40c0db8ff0cd81008180a91e9138742c0ce1caa4ee5ba37da1b511b5
Saving artifacts...
```

then everything went well, and your contracts are now deployed on Rinkeby!

## Saving Deployed Addresses

Information about deployment addresses *should* be preserved. In order to achieve this, we can use a script included with `olympia-token` to extract this information from the build artifacts into a file which sits outside of the Git ignore list:

```sh
npm run extractnetinfo
```

Running this command will create or overwrite `networks.json` with all of the network information contained in the build artifacts. This is the file which should be checked into version control. Once we have this, build artifacts containing the deployment information for the Rinkeby network can be restored from plain build artifacts:

```sh
npm run injectnetinfo
```

Furthermore, if there are future deployments which clutter or overwrite existing deployment information, the build artifacts can still be reset to this point:

```sh
npm run resetnetinfo
```

Note that `resetnetinfo` is invoked as part of `prepublishOnly` to ensure that build artifacts published on NPM contain just the deployment information required for dapp clients.

# Issue tokens

You can use the following script to have each address in a list issued 10^18 units of PlayToken:

```sh
truffle exec scripts/issue_tokens.js --network=rinkeby --amount 1e18 --to <comma separated addresses>
```

Both the `amount` and the list of addresses are adjustable.
