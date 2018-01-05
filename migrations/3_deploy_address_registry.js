const AddressRegistry = artifacts.require('AddressRegistry')

module.exports = function(deployer) {
    deployer.deploy(AddressRegistry)
}
