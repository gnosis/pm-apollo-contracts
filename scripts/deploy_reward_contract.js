const RewardClaimHandler = artifacts.require('RewardClaimHandler')
const args = require('yargs').argv;
module.exports = function(callback){
    if (args.token) {
        RewardClaimHandler.new(args.token).then(
            (contract) => {
                console.log("RewardClaimHandler: " + contract.address)
                console.log("Transaction hash: "+ contract.transactionHash)

                callback();
            }
        )
    }
    else{
        callback("Argument --token must be provided")
    }
}