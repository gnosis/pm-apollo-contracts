pragma solidity 0.4.15;

contract AddressRegistry {
    mapping (address => address) public mainnetAddressFor;

    event AddressRegistration(address registrant, address registeredMainnetAddress);

    function register(address mainnetAddress) public {
        AddressRegistration(msg.sender, mainnetAddress);
        mainnetAddressFor[msg.sender] = mainnetAddress;
    }
}
