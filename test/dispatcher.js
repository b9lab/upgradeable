"use strict";

const Dispatcher = artifacts.require("./Dispatcher.sol");
const Counter = artifacts.require("./Counter.sol");
const CounterDouble = artifacts.require("./CounterDouble.sol");
const expectedException = require("../utils/expectedException.js");
const makeSureAreUnlocked = require("../utils/makeSureAreUnlocked.js");
Promise.allSequential = require("../utils/sequentialPromise.js");

contract("Dispatcher", function(accounts) {
    let owner, counterImpl1, counterImpl2, dispatcher, counter;

    before("should prepare accounts", function() {
        assert.isAtLeast(accounts.length, 1);
        owner = accounts[ 0 ];
        return makeSureAreUnlocked([ owner ]);
    });

    beforeEach("should deploy 2 implementations and a dispatcher", function() {
        return Promise.allSequential([
                () => Counter.new({ from: owner }),
                () => CounterDouble.new({ from: owner })
            ])
            .then(implementations => {
                [ counterImpl1, counterImpl2 ] = implementations;
                return Dispatcher.new(counterImpl1.address, { from: owner });
            })
            .then(created => {
                dispatcher = created;
                // Now we create the "pretend" counter.
                counter = Counter.at(dispatcher.address);
            });
    });

    it("should work by forwarding, increment", function() {
        return counter.getCounter()
            .then(value => assert.strictEqual(value.toNumber(), 0))
            .then(() => counter.increment())
            .then(txObject => counter.getCounter())
            .then(value => assert.strictEqual(value.toNumber(), 1));
    });

    it("should work by forwarding, reset", function() {
        return counter.getCounter()
            .then(value => assert.strictEqual(value.toNumber(), 0))
            .then(() => counter.reset(3))
            .then(txObject => counter.getCounter())
            .then(value => assert.strictEqual(value.toNumber(), 3));
    });

    it("should change implementation", function() {
        return counter.increment({ from: owner })
            .then(txObject => counter.upgradeTo(counterImpl2.address))
            .then(txObject => counter = CounterDouble.at(counter.address))
            .then(() => counter.getCounterBefore())
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
                .then(value => assert.strictEqual(value.toNumber(), 3))
                .then(() => counter.getCounter2())
                .then(value => assert.strictEqual(value.toNumber(), 4));
        });

        it("should not be possible to use old interface", function() {
            return Counter.at(counter.address).getCounter()
                // We just spied some random memory address
                .then(value => assert.isAtLeast(Math.abs(value.toNumber()), 1000));
        });

        it("should be possible to upgrade to previous implementation", function() {
            return Counter.at(counter.address).upgradeTo(counterImpl1.address)
                .then(txObject => counter = Counter.at(counter.address))
                .then(() => counter.getCounter())
                .then(value => assert.strictEqual(value.toNumber(), 1));
        });
    });
});