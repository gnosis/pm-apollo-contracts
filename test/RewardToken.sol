pragma solidity 0.4.15;

import "@gnosis.pm/gnosis-core-contracts/contracts/Tokens/StandardToken.sol";

contract RewardToken is StandardToken {
    string public constant name = "Reward Token";
    string public constant symbol = "RWD";
    uint8 public constant decimals = 18;

    /// @dev Creates a fake token where the creator starts with uint max worth of coin
    function RewardToken()
        public
    {
        balances[msg.sender] = 2**256-1;
        Transfer(0, msg.sender, 2**256-1);
        totalTokens = 2**256-1;
    }
}
