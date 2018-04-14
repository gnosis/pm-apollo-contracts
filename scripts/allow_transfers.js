module.exports = require('./play_token_cli_wrapper')(
  artifacts,
  async function(PlayToken, args) {
    if(!args.addresses) {
      throw "[Error] need to set --addresses"
    }
    const instance = await PlayToken.deployed()
    await instance.allowTransfers(args.addresses.split(','))
    console.log(`Allowed transfers to and from the following addresses:\n${
      args.addresses.replace(',', '\n')
    }`)
  }
)
