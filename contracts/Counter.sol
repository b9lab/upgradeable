pragma solidity ^0.4.15;

import "./OwnedUpgradeable.sol";

/**
 * The order of inheritance is the same as for Dispatcher.
 */
contract Counter is OwnedUpgradeable {
    uint counter;

     function initialize() {
        _sizes[bytes4(keccak256("getCounter()"))] = 32;
        _sizes[bytes4(keccak256("increment()"))] = 32;
        // reset() returns nothing
    }   

    function getCounter() constant returns (uint) {
        return counter;
    }

    function increment() returns (uint) {
        return ++counter;
    }

    function reset(uint newCounter) {
        counter = newCounter;
    }

    function upgradeTo(address target) fromOwner returns (bool) {
        return replace(target);
    }
}