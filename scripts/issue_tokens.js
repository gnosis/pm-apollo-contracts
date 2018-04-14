module.exports = require('./play_token_cli_wrapper')(
  artifacts,
  async function(PlayToken, args) {
    if(!args.amount || !args.to) {
      throw "[Error] need to set --amount and --to parameters"
    }
    const instance = await PlayToken.deployed()
    await instance.issue(args.to.split(','), args.amount)
    console.log(`${args.amount} tokens issued to the following accounts:\n${
      args.to.replace(',', '\n')
    }`)
  }
)
