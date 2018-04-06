pragma solidity 0.4.15;

import "@gnosis.pm/gnosis-core-contracts/contracts/Tokens/StandardToken.sol";

contract PlayToken is StandardToken {
    /*
     *  Events
     */
    event Issuance(address indexed owner, uint amount);

    /*
     *  Constants
     */
    bool public constant isPlayToken = true;

    /*
     *  Storage
     */
    address public creator;
    mapping (address => bool) public whitelist;
    mapping (address => bool) public admins;

    /*
     *  Modifiers
     */
    modifier isCreator { 
        require(msg.sender == creator);
        _;
    }
    modifier isAdmin { 
        require(msg.sender == creator || admins[msg.sender] == true);
        _;
    }

    /*
     *  Public functions
     */
    /// @dev Constructor sets events contract address
    function PlayToken()
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

    /// @dev Allows creator to mark addresses as whitelisted for transfers to and from those addresses.
    /// @param allowed Addresses to be added to the whitelist
    function allowTransfers(address[] allowed)
        public
        isAdmin
    {
        for(uint i = 0; i < allowed.length; i++) {
            whitelist[allowed[i]] = true;
        }
    }

    /// @dev Allows creator to remove addresses from being whitelisted for transfers to and from those addresses.
    /// @param disallowed Addresses to be removed from the whitelist
    function disallowTransfers(address[] disallowed)
        public
        isAdmin
    {
        for(uint i = 0; i < disallowed.length; i++) {
            whitelist[disallowed[i]] = false;
        }
    }

    /// @dev Allows creator to add admins that can whitelist addresses.
    /// @param _admins Addresses to be added as admin role
    function addAdmin(address[] _admins)
        public
        isCreator
    {
        for(uint i = 0; i < _admins.length; i++) {
            admins[_admins[i]] = true;
        }
    }

    /// @dev Allows creator to remove addresses from admin role.
    /// @param _admins Addresses to be removed from the admin mapping
    function removeAdmin(address[] _admins)
        public
        isCreator
    {
        for(uint i = 0; i < _admins.length; i++) {
            admins[_admins[i]] = false;
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
