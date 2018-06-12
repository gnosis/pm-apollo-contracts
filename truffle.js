const HDWalletProvider = require('truffle-hdwallet-provider')

// Get the mnemonic
const mnemonic = process.env.MNEMONIC

// Allow to add an aditional network (useful for docker-compose setups)
//  i.e. NETWORK='{ "name": "docker", "networkId": "99999", "url": "http://rpc:8545", "gas": "6700000", "gasPrice": "25000000000"  }'
const aditionalNetworkJson = process.env.NETWORK

let aditionalNetwork = process.env.NETWORK ? JSON.parse(process.env.NETWORK) : null

const networks = {
    development: {
      host: 'localhost',
      port: 8545,
      gas: 6700000,
      network_id: '*',
    },
    mainnet: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/');
      },
      network_id: '1',
      gasPrice: 10000000000,
    },
    kovan: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'https://kovan.infura.io/');
      },
      network_id: '42',
      gasPrice: 25000000000,
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'https://node.rinkeby.gnosisdev.com:443');
      },
      network_id: '4',
      gasPrice: 50000000000
    }
  }
  
  if (aditionalNetwork) {
    const { name, url, networkId, gas, gasPrice } = aditionalNetwork
    networks[name] = {
      provider: function() {
        return new HDWalletProvider(mnemonic, url);
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
