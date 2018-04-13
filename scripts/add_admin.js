const OlympiaToken = artifacts.require('OlympiaToken')
const args = require('yargs').argv;

module.exports = async function(callback) {
  if(args.addresses) {
    const instance = await OlympiaToken.deployed()
    await instance.addAdmin(args.addresses.split(','), console.log)
    console.log(`Added admins ${args.addresses.split(',')}`)
    callback()
  }
  else{
    callback("[Error] need to set --addresses")
  }
}
