const OlympiaToken = artifacts.require('OlympiaToken')
const args = require('yargs').argv;

module.exports = async function(callback) {
  if(args.amount && args.to) {
    const instance = await OlympiaToken.deployed()
    await instance.issue(args.to.split(','), args.amount, console.log)
    console.log(`${args.amount} Tokens issued to ${args.to}`)
    callback()
  }
  else{
    callback("[Error] need to set --amount and --to parameters")
  }
}