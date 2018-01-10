pragma solidity ^0.4.15;

import "./OwnedUpgradeable.sol";

/**
 * The dispatcher is a minimal 'shim' that dispatches calls to a targeted
 * contract. Calls are made using 'delegatecall', meaning all storage and value
 * is kept on the dispatcher. As a result, when the target is updated, the new
 * contract inherits all the stored data and value from the old contract.
 *
 * Notice how both Counter and Dispatcher inherit Owned and Upgradeable in the
 * same order.
 * The dispatcher does not have access to the storage changes that take place
 * in the constructor of the target, so we need to inherit Owned too.
 */
contract Dispatcher is OwnedUpgradeable {
    function Dispatcher(address target) {
        replace(target);
    }

    function initialize() {
        // Should only be called by on target contracts, not on the dispatcher
        throw;
    }

    function() {
        bytes4 sig;
        assembly { sig := calldataload(0) }
        uint len = _sizes[sig];
        address target = _dest;
        
        assembly {
            // return _dest.delegatecall(msg.data)
            calldatacopy(0x0, 0x0, calldatasize)
            pop(delegatecall(gas, target, 0x0, calldatasize, 0, len))
            return(0, len)
        }
    }
}