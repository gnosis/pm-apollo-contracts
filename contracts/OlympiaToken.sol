pragma solidity 0.4.15;

import "@gnosis.pm/gnosis-core-contracts/contracts/Tokens/StandardToken.sol";

contract OlympiaToken is StandardToken {
    /*
     *  Events
     */
    event Issuance(address indexed owner, uint amount);

    /*
     *  Constants
     */
    string public constant name = "Olympia Token";
    string public constant symbol = "OLY";
    uint8 public constant decimals = 18;

    /*
     *  Storage
     */
    address public creator;

    /*
     *  Modifiers
     */
    modifier isCreator { require(msg.sender == creator); _; }

    /*
     *  Public functions
     */
    /// @dev Constructor sets events contract address
    function OlympiaToken()
        public
    {
        creator = msg.sender;
    }

    /// @dev Allows creator to issue tokens. Will reject if msg.sender isn't the creator.
    /// @param recipients Addresses of recipients
    /// @param amount Number of tokens to issue each recipient
    function issue(address[] recipients, uint amount)
        public
        isCreator
    {
        for(uint i = 0; i < recipients.length; i++) {
            address recipient = recipients[i];
            balances[recipient] = balances[recipient].add(amount);
            Issuance(recipient, amount);
        }
        totalTokens = totalTokens.add(amount.mul(recipients.length));
    }
}
