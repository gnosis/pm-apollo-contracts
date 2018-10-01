const HDWalletProvider = require('truffle-hdwallet-provider')
const PrivateKeyProvider = require("truffle-privatekey-provider");

// Get the mnemonic
const mnemonic = process.env.MNEMONIC

// Get the private key
const privateKey = process.env.PRIVATEKEY

if (!mnemonic && !privateKey){
  console.error("You need to provide MNEMONIC or PRIVATEKEY as env variable");
  return;
}

if (mnemonic && privateKey){
  console.error("You can only use MNEMONIC or PRIVATEKEY, not both")
  return;
}

// Allow to add an aditional network (useful for docker-compose setups)
//  i.e. NETWORK='{ "name": "docker", "networkId": "99999", "url": "http://rpc:8545", "gas": "6700000", "gasPrice": "25000000000"  }'
const aditionalNetworkJson = process.env.NETWORK

let aditionalNetwork = process.env.NETWORK ? JSON.parse(process.env.NETWORK) : null

function getProvider(url){
  if (mnemonic){
    return new HDWalletProvider(mnemonic, url)
  }
  else if(privateKey){
    return new PrivateKeyProvider(privateKey, url)
  }
}

const networks = {
    development: {
      host: 'localhost',
      port: 8545,
      gas: 6700000,
      network_id: '*',
    },
    mainnet: {
      provider: function() {
        return getProvider('https://mainnet.infura.io/')
      },
      network_id: '1',
      gasPrice: 10000000000,
    },
    kovan: {
      provider: function() {
        return getProvider('https://kovan.infura.io/')
      },
      network_id: '42',
      gasPrice: 25000000000,
    },
    rinkeby: {
      provider: function() {
        return getProvider('https://rinkeby.infura.io/');
      },
      network_id: '4',
      gasPrice: 50000000000
    }
  }

  if (aditionalNetwork) {
    const { name, url, networkId, gas, gasPrice } = aditionalNetwork
    networks[name] = {
      provider: function() {
        return getProvider(url);
      },
      network_id: networkId,
      gas,
      gasPrice,
    }
  }

  module.exports = {
    networks,
    solc: {
      optimizer: {
        enabled: false
      },
    },
  }
