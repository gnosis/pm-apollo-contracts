# OLY Token Contract

This is the Olympia token contract implementation:
  - Rinkeby:
    - Address: `0xa0c107Db0e9194c18359d3265289239453b56CF2`
    - Creator: `0x0778858af811B0D6E95928cD7774BD63143EF31c`

The mainnet address registry can be found:
  - Rinkeby:
    - Address: `0x79DA1C9eF6bf6bC64E66F8AbFFDDC1A093E50f13`
    - Creator: `0x76C5AF09C7724EdFD68dfCe98A9C6E15e48EaED7`

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
