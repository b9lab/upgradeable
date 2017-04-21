"use strict";

const Promise = require("bluebird");
const Dispatcher = artifacts.require("./Dispatcher.sol");
const Counter = artifacts.require("./Counter.sol");
const CounterDouble = artifacts.require("./CounterDouble.sol");
const expectedException = require("../utils/expectedException.js");

contract("Dispatcher", function(accounts) {
    let owner, counterImpl1, counterImpl2, dispatcher, counter;

    before("should prepare accounts", function() {
        owner = accounts[ 0 ];
        Promise.promisifyAll(web3.eth, { suffix: "Promise" });
        Promise.promisifyAll(web3.currentProvider, { suffix: "Promise" });
    });

    beforeEach("should deploy 2 implementations and a dispatcher", function() {
        return Counter.new({ from: owner })
            .then(created => {
                counterImpl1 = created;
                return Dispatcher.new(counterImpl1.address, { from: owner })
            })
            .then(created => {
                dispatcher = created;
                counter = Counter.at(dispatcher.address);
                return CounterDouble.new({ from: owner });
            })
            .then(created => counterImpl2 = created);
    });

    it("should work by forwarding, increment", function() {
        return counter.getCounter()
            .then(value => {
                assert.strictEqual(value.toNumber(), 0);
                return counter.increment();
            })
            .then(txObject => counter.getCounter())
            .then(value => assert.strictEqual(value.toNumber(), 1));
    });

    it("should work by forwarding, reset", function() {
        return counter.getCounter()
            .then(value => {
                assert.strictEqual(value.toNumber(), 0);
                return counter.reset(3);
            })
            .then(txObject => counter.getCounter())
            .then(value => assert.strictEqual(value.toNumber(), 3));
    });

    it("should change implementation", function() {
        return counter.increment({ from: owner })
            .then(txObject => counter.upgradeTo(counterImpl2.address))
            .then(txObject => {
                counter = CounterDouble.at(counter.address);
                return counter.getCounterBefore();
            })
            .then(value => assert.strictEqual(value.toNumber(), 1));
    });

    describe("increment then change implementation", function() {
        beforeEach("should prepare", function() {
            return counter.increment({ from: owner })
                .then(txObject => counter.upgradeTo(counterImpl2.address))
                .then(txObject => counter = CounterDouble.at(counter.address));
        });

        it("should use new implementation", function() {
            return counter.incrementMore({ from: owner })
                .then(txObject => counter.getCounterBefore())
                .then(value => {
                    assert.strictEqual(value.toNumber(), 3);
                    return counter.getCounter2();
                })
                .then(value => assert.strictEqual(value.toNumber(), 4));
        });

        it("should not be possible to use old interface", function() {
            return Counter.at(counter.address).getCounter()
                // We just spied some random memory address
                .then(value => assert.isAtLeast(Math.abs(value.toNumber()), 1000));
        });

        it("should be possible to upgrade to previous implementation", function() {
            return Counter.at(counter.address).upgradeTo(counterImpl1.address)
                .then(txObject => {
                    counter = Counter.at(counter.address);
                    return counter.getCounter();
                })
                .then(value => assert.strictEqual(value.toNumber(), 1));
        });
    });

    describe("new gas cost", function() {
        it("should fail if new gas cost is too low", function() {
            return dispatcher.setReturnGasCost(42, { from: owner })
                .then(txObject => expectedException(
                    () => counter.increment({ from: owner, gas: 3000000 }),
                    3000000));
        });

        it("should pass if new gas cost is enough", function() {
            return dispatcher.setReturnGasCost(43, { from: owner })
                .then(txObject => counter.increment({ from: owner }));
        });
    });
});