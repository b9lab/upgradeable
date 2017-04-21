pragma solidity ^0.4.8;

contract Owned {
    address public owner;

    function Owned() {
        owner = msg.sender;
    }

    modifier fromOwner {
        if (msg.sender != owner) {
            throw;
        }
        _;
    }

    function setOwner(address newOwner) fromOwner {
        if (newOwner == 0) {
            throw;
        }
        owner = newOwner;
    }
}