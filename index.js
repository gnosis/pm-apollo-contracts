module.exports = [
    'AddressRegistry',
    'OlympiaToken',
    'PlayToken',
    'RewardClaimHandler'
].reduce((o, n) => (o[n] = require(`./build/contracts/${ n }.json`), o), {})
