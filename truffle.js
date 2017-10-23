const config = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*",
        },
        rinkeby: {
            host: "localhost",
            port: 8545,
            network_id: "4",
        },
    },
}

const merge = require('lodash.merge')

try {
    merge(config, require('./truffle-local'))
}
catch(e) {
    if(e.code === 'MODULE_NOT_FOUND') {
        // eslint-disable-next-line no-console
        console.log('No local truffle config found. Using all defaults...')
    } else {
        // eslint-disable-next-line no-console
        console.warn('Tried processing local config but got error:', e)
    }
}

module.exports = config
