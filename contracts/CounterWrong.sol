pragma solidity ^0.4.15;

/**
 * Broke the order of inheritance from Dispatcher.
 */
contract CounterWrong /* is not OwnedUpgradeable */ {
    // This counter takes the place of `address public owner;` in Owned
    uint counter;
    // Mimic Upgradeable
    mapping(bytes4 => uint) _sizes;

    function initialize() {
        _sizes[bytes4(keccak256("getCounter()"))] = 32;
        _sizes[bytes4(keccak256("increment()"))] = 32;
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
}