const OlympiaToken = artifacts.require('OlympiaToken')
const args = require('yargs').argv;

module.exports = function(deployer) {
    deployer
        .deploy(OlympiaToken)
        .then(
            deployedToken => {
                if (args.admins) {
                    return OlympiaToken.deployed().then(
                        olympiaInstance => {
                            const admins = args.admins.split(',')
                            console.log("Adding admins...", admins)
                            return olympiaInstance.addAdmin(admins)
                        }
                    )
                }
            }
        )
}
