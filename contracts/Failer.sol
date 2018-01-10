pragma solidity ^0.4.15;

import "./OwnedUpgradeable.sol";

/**
 * The order of inheritance is the same as for Dispatcher.
 */
contract Failer is OwnedUpgradeable {

     function initialize() {
        _sizes[bytes4(keccak256("failMe()"))] = 0;
        // reset() returns nothing
    }   

    function failMe() returns (uint) {
        bytes32 error = "Failed you";
        assembly {
            mstore(0, error)
            revert(0, 32)
        }
    }

    function upgradeTo(address target) fromOwner returns (bool) {
        return replace(target);
    }
}