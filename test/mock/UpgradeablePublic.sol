pragma solidity ^0.4.8;

import "../../contracts/OwnedUpgradeable.sol";

/*
 * Here too the inheritance order must be the same as on Dispatcher.
 */
contract UpgradeablePublic is OwnedUpgradeable {
    uint public initializeCount;

    function initialize() {
        initializeCount++;
    }

	function sizes(bytes4 sig) returns (uint) {
        return _sizes[sig];
    }

    function dest() returns (address) {
        return _dest;
    }

    function replacePublic(address target) returns (bool) {
        return Upgradeable.replace(target);
    }
}