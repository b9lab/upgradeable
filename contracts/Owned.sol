pragma solidity ^0.4.10;

contract Owned {
    address public owner;

    function Owned() {
        owner = msg.sender;
    }

    modifier fromOwner {
        require(msg.sender == owner);
        _;
    }

    function setOwner(address newOwner) fromOwner {
        require(newOwner != 0);
        owner = newOwner;
    }
}