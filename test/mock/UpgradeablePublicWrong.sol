pragma solidity ^0.4.8;

import "../../contracts/Owned.sol";
import "../../contracts/Upgradeable.sol";

/*
 * Notice how the inheritance order of Owned and Upgradeable is reversed
 * compared to Dispatcher.
 */
contract UpgradeablePublicWrong is Upgradeable, Owned {
    function sizes(bytes4 sig) returns (uint) {
        return _sizes[sig];
    }

    function dest() returns (address) {
        return _dest;
    }

    function initialize() {
    	throw;
    }

    function replacePublic(address target) returns (bool) {
        return Upgradeable.replace(target);
    }
}