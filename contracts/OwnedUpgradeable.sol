pragma solidity ^0.4.10;

import "./Owned.sol";
import "./Upgradeable.sol";

/**
 * Enforces the order of inheritance to reduce the scope for errors.
 */
contract OwnedUpgradeable is Owned, Upgradeable {
}