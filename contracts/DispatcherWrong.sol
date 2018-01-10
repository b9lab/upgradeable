pragma solidity ^0.4.15;

import "./OwnedUpgradeable.sol";

/**
 * This one is wrong because it defines a storage of its own.
 */
contract DispatcherWrong is OwnedUpgradeable {

    bytes32 public messedUp;

    function DispatcherWrong(address target) {
        replace(target);
        messedUp = "Messed up";
    }

    function initialize() {
        // Should only be called by on target contracts, not on the dispatcher
        revert();
    }

    function() {
        bytes4 sig;
        assembly { sig := calldataload(0) }
        uint len = _sizes[sig];
        address target = _dest;
        
        assembly {
            // return _dest.delegatecall(msg.data)
            calldatacopy(0x0, 0x0, calldatasize)
            switch delegatecall(gas, target, 0x0, calldatasize, 0, len)
            case 0 {
                // Bubble failure up
                revert(0, 32)
            }
            default {
                return(0, len)
            }
        }
    }
}