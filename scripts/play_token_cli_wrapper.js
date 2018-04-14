const args = require('yargs').argv;
const playTokenName = args.playTokenName || 'OlympiaToken'

module.exports = (artifacts, fn) => async function(callback) {
  const PlayToken = artifacts.require(playTokenName)
  if(args.from) {
    PlayToken.defaults({ from: args.from })
  }
  try {
    await fn(PlayToken, args)
    callback()
  } catch(e) {
    callback(e)
  }
}
