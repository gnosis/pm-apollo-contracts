pragma solidity 0.4.15;

import "@gnosis.pm/gnosis-core-contracts/contracts/Tokens/StandardToken.sol";

contract PlayToken is StandardToken {
    /*
     *  Events
     */
    event Issuance(address indexed owner, uint amount);

    /*
     *  Storage
     */
    address public creator;
    mapping (address => bool) public whitelist;

    /*
     *  Modifiers
     */
    modifier isCreator { require(msg.sender == creator); _; }

    /*
     *  Public functions
     */
    /// @dev Constructor sets events contract address
    function PlayToken()
        public
    {
        creator = msg.sender;
    }

    function isPlayToken()
        public
        constant returns (bool)
    {
        return true;
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

    /// @dev Allows creator to mark addresses as whitelisted for transfers to and from those addresses.
    /// @param allowed Addresses to be added to the whitelist
    function allowTransfers(address[] allowed)
        public
        isCreator
    {
        for(uint i = 0; i < allowed.length; i++) {
            whitelist[allowed[i]] = true;
        }
    }

    /// @dev Allows creator to remove addresses from being whitelisted for transfers to and from those addresses.
    /// @param disallowed Addresses to be removed from the whitelist
    function disallowTransfers(address[] disallowed)
        public
        isCreator
    {
        for(uint i = 0; i < disallowed.length; i++) {
            whitelist[disallowed[i]] = false;
        }
    }

    function transfer(address to, uint value) public returns (bool) {
        require(whitelist[msg.sender] || whitelist[to]);
        return super.transfer(to, value);
    }

    function transferFrom(address from, address to, uint value) public returns (bool) {
        require(whitelist[from] || whitelist[to]);
        return super.transferFrom(from, to, value);
    }
}
