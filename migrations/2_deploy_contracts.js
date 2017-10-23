const Math = artifacts.require('Math')
const OlympiaToken = artifacts.require('OlympiaToken')

module.exports = function(deployer) {
    deployer.deploy(Math)
    deployer.link(Math, OlympiaToken)
    deployer.deploy(OlympiaToken)
}
