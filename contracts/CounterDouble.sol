pragma solidity ^0.4.15;

import "./OwnedUpgradeable.sol";

/**
 * The order of inheritance is the same as for Dispatcher.
 */
contract CounterDouble is OwnedUpgradeable {
    // It is the same as counter in Counter, just with a different name.
    uint counterBefore;
    uint counter2;

     function initialize() {
        _sizes[bytes4(keccak256("getCounterBefore()"))] = 32;
        _sizes[bytes4(keccak256("getCounter2()"))] = 32;
        // incrementMore() returns nothing
        // reset() returns nothing
    }   

    function getCounterBefore() constant returns (uint) {
        return counterBefore;
    }

    function getCounter2() constant returns (uint) {
        return counter2;
    }

    function incrementMore() {
        counterBefore += 2;
        counter2 += 4;
    }

    function upgradeTo(address target) fromOwner returns (bool) {
        return replace(target);
    }
}