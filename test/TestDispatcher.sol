pragma solidity ^0.4.10;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Counter.sol";
import "../contracts/Dispatcher.sol";

contract TestDispatcher {
    function testDispatcherShouldDispatch() {
        Counter counter = new Counter();
        Dispatcher dispatcher = new Dispatcher(counter);
        Assert.equal(Counter(dispatcher).getCounter(), 0, "should be starting value");
        Assert.equal(Counter(dispatcher).increment(), 1, "should be incremented value");
        Assert.equal(Counter(dispatcher).getCounter(), 1, "should be new value from dispatcher");
        Assert.equal(counter.getCounter(), 0, "target storage remains unchanged");
    }

    function testDispatchShouldHandOverKeepStorage() {
        Counter counter1 = new Counter();
        Dispatcher dispatcher = new Dispatcher(counter1);
        Counter(dispatcher).increment();
        Counter counter2 = new Counter();
        Counter(dispatcher).upgradeTo(counter2);
        Assert.equal(Counter(dispatcher).getCounter(), 1, "should be previous value");
    }

    function testDispatchShouldHandOverContinueTicking() {
        Counter counter1 = new Counter();
        Dispatcher dispatcher = new Dispatcher(counter1);
        Counter(dispatcher).increment();
        Counter counter2 = new Counter();
        Counter(dispatcher).upgradeTo(counter2);
        Assert.equal(Counter(dispatcher).increment(), 2, "should be incremented value from previous");
    }	
}