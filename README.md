# OLY Token Contract

This is the Olympia token contract implementation:
  - Rinkeby:
    - Address: `0x979861df79c7408553aaf20c01cfb3f81ccf9341`
    - Creator: `0xcAb5bb0408C48780D38C452bE20E30da1A10e656`

The mainnet address registry can be found:
  - Rinkeby:
    - Address: `0x6427d856450b20f6fab88be18d949faf9c4da512`
    - Creator: `0xcAb5bb0408C48780D38C452bE20E30da1A10e656`

# Deployment of custom contracts on Rinkeby

```sh
git clone https://github.com/gnosis/olympia-token
cd olympia-token
```

Create a `truffle-local` file and **configure your account** for rinkeby (recommended network) with
12 words mnemonic:

```js
var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "void crawl erase remove sail disease step company machine crime indoor square"; // 12 word mnemonic
var provider = new HDWalletProvider(mnemonic, "https://rinkeby.infura.io:443");
const config = {
  networks: {
      rinkeby: {
          port: 443,
          network_id: "4",
          provider: provider,
          gasPrice: 50000000000
      },
  },
}
module.exports = config;
```

Then run:

```sh
npm install
npm run compile
npm run migrate -- --network rinkeby
# if you want to deploy the markets with another account (recommended), you will need to add those accounts as admins
npm run migrate -- --network rinkeby --admins=address1,...,address2 (comma separated)
```

You have now the addresses for AddressRegistry and Olympia Token, should be something like:

```
OlympiaToken: 0x2924e2338356c912634a513150e6ff5be890f7a0
AddressRegistry: 0x12f73864dc1f603b2e62a36b210c294fd286f9fc
```

# Issue tokens
```sh
truffle exec scripts/issue_tokens.js --network=rinkeby --amount 1e18 --to <comma separated addresses>
```
