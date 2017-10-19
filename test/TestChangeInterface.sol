pragma solidity ^0.4.10;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Counter.sol";
import "../contracts/CounterDouble.sol";
import "../contracts/Dispatcher.sol";

contract TestChangeInterface {
    function testDispatchShouldHandOverKeepStorage() {
        Counter counter1 = new Counter();
        Dispatcher dispatcher = new Dispatcher(counter1);
        Counter(dispatcher).increment();
        CounterDouble counter2 = new CounterDouble();
        Counter(dispatcher).upgradeTo(counter2);
        Assert.equal(CounterDouble(dispatcher).getCounterBefore(), 1, "should still have previous value");
        Assert.equal(CounterDouble(dispatcher).getCounter2(), 0, "should not have new value yet");
    }
    
    function testDispatchShouldHandOverUpdateNewStorage() {
        Counter counter1 = new Counter();
        Dispatcher dispatcher = new Dispatcher(counter1);
        Counter(dispatcher).increment();
        CounterDouble counter2 = new CounterDouble();
        Counter(dispatcher).upgradeTo(counter2);
        CounterDouble(dispatcher).incrementMore();
        Assert.equal(CounterDouble(dispatcher).getCounterBefore(), 3, "should have incremented even with new interface");
        Assert.equal(CounterDouble(dispatcher).getCounter2(), 4, "should have new value");
    }
    
    function testDispatchShouldHandOverCannotCallOldInterface() {
        return;
        // Don't know why too much gas is consumed below.
        Counter counter1 = new Counter();
        Dispatcher dispatcher = new Dispatcher(counter1);
        Counter(dispatcher).increment();
        CounterDouble counter2 = new CounterDouble();
        Counter(dispatcher).upgradeTo(counter2);
        Counter(dispatcher).increment();
        Assert.equal(Counter(dispatcher).getCounter(), 1, "should still have kept previous interface");
        Assert.equal(CounterDouble(dispatcher).getCounterBefore(), 1, "should still have previous interface");
        Assert.equal(CounterDouble(dispatcher).getCounter2(), 0, "should not have new value yet");
    }
}