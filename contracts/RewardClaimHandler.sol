pragma solidity 0.4.15;

import "@gnosis.pm/gnosis-core-contracts/contracts/Tokens/Token.sol";

contract RewardClaimHandler {
    Token public rewardToken;
    address public operator;
    address[] public winners;
    mapping (address => uint) public rewardAmounts;
    uint public guaranteedClaimEndTime;

    function RewardClaimHandler(Token _rewardToken) public {
        rewardToken = _rewardToken;
        operator = msg.sender;
    }

    function registerRewards(address[] _winners, uint[] _rewardAmounts, uint duration) public {
        require(
            winners.length == 0 &&
            _winners.length > 0 &&
            _winners.length == _rewardAmounts.length &&
            msg.sender == operator
        );

        uint totalAmount = 0;
        for(uint i = 0; i < _winners.length; i++) {
            totalAmount += _rewardAmounts[i];
            rewardAmounts[_winners[i]] = _rewardAmounts[i];
        }

        require(rewardToken.transferFrom(msg.sender, this, totalAmount));

        winners = _winners;
        guaranteedClaimEndTime = now + duration;
    }

    function claimReward() public {
        require(winners.length > 0 && rewardToken.transfer(msg.sender, rewardAmounts[msg.sender]));
        rewardAmounts[msg.sender] = 0;
    }

    function retractRewards() public {
        require(winners.length > 0 && msg.sender == operator && now >= guaranteedClaimEndTime);

        uint totalAmount = 0;
        for(uint i = 0; i < winners.length; i++) {
            totalAmount += rewardAmounts[winners[i]];
            rewardAmounts[winners[i]] = 0;
            // We don't use:
            //     winners[i] = 0;
            // because of this:
            // https://ethereum.stackexchange.com/questions/3373/how-to-clear-large-arrays-without-blowing-the-gas-limit
            // This is a more gas efficient overall if more than one run happens
        }

        require(rewardToken.transfer(msg.sender, totalAmount));

        winners.length = 0;
    }
}
