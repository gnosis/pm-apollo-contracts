module.exports = require('./play_token_cli_wrapper')(
  artifacts,
  async function(PlayToken, args) {
    if(!args.addresses) {
      throw "[Error] need to set --addresses"
    }
    const instance = await PlayToken.deployed()
    await instance.addAdmin(args.addresses.split(','))
    console.log(`Added the following accounts as admins:\n${
      args.addresses.replace(',', '\n')
    }`)
  }
)
