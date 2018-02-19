pragma solidity 0.4.15;

import "@gnosis.pm/gnosis-core-contracts/contracts/Tokens/Token.sol";

contract RewardClaimHandler {
    Token public rewardToken;
    address public operator;
    address[] public winners;

    function RewardClaimHandler(Token _rewardToken) public {
        rewardToken = _rewardToken;
        operator = msg.sender;
    }

    function registerRewards(address[] _winners, uint[] rewardAmounts) public {
        require(
            winners.length == 0 &&
            _winners.length > 0 &&
            _winners.length == rewardAmounts.length &&
            msg.sender == operator
        );

        uint totalAmount = 0;
        for(uint i = 0; i < _winners.length; i++) {
            totalAmount += rewardAmounts[i];
        }

        require(rewardToken.transferFrom(msg.sender, this, totalAmount));

        winners = _winners;
    }

}
