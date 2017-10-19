pragma solidity ^0.4.10;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Counter.sol";
import "./mock/UpgradeablePublic.sol";
import "./mock/UpgradeablePublicWrong.sol";

contract TestUpgradeable {
    function testCanReplaceToDummyTarget() {
        UpgradeablePublic upgradeable = new UpgradeablePublic();
        Assert.isTrue(upgradeable.replacePublic(0), "should not throw on replace with 0 address");
        Assert.equal(upgradeable.initializeCount(), 0, "should not have called initialize on self");
        Assert.equal(upgradeable.dest(), 0, "should have put the target address");
    }

    function testCanReplaceToUpgradeable() {
        UpgradeablePublic target = new UpgradeablePublic();
        UpgradeablePublic upgradeable = new UpgradeablePublic();
        Assert.isTrue(upgradeable.replacePublic(target), "should not throw on replace with proper address");
        Assert.equal(target.initializeCount(), 0, "should not have called initialize on target");
        Assert.equal(target.dest(), 0, "should have not put the target address into the target");
        Assert.equal(upgradeable.initializeCount(), 1, "should have been as if called initialize on self");
        Assert.equal(upgradeable.dest(), target, "should have put the target address");
    }

    function testCanReplaceToCounter() {
        Counter target = new Counter();
        UpgradeablePublic upgradeable = new UpgradeablePublic();
        Assert.isTrue(upgradeable.replacePublic(target), "should not throw on replace with proper address");
        Assert.equal(upgradeable.sizes(bytes4(sha3("getCounter()"))), 32, "should have saved return size");
        Assert.equal(upgradeable.sizes(bytes4(sha3("increment()"))), 32, "should have saved return size");
        Assert.equal(upgradeable.sizes(0x11223344), 0, "should have 0 on dummy signature");
    }

    function testReplaceToCounterWithPublicWrongFails() {
        Counter target = new Counter();
        UpgradeablePublicWrong upgradeable = new UpgradeablePublicWrong();
        Assert.isTrue(upgradeable.replacePublic(target), "should not throw on replace with proper address");
        Assert.equal(upgradeable.sizes(bytes4(sha3("getCounter()"))), 0, "should not have saved return size");
        Assert.equal(upgradeable.sizes(bytes4(sha3("increment()"))), 0, "should not have saved return size");
    }
}
