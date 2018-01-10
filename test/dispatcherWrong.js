"use strict";

const Promise = require("bluebird");
const DispatcherWrong = artifacts.require("./DispatcherWrong.sol");
const Counter = artifacts.require("./Counter.sol");
const makeSureAreUnlocked = require("../utils/makeSureAreUnlocked.js");
Promise.allSequential = require("../utils/sequentialPromise.js");

if (typeof web3.eth.getBlockPromise !== "function") {
    Promise.promisifyAll(web3.eth, { suffix: "Promise" });
}

contract("Dispatcher with Counter", function(accounts) {
    let owner, counterImpl, dispatcher, counter;

    before("should prepare accounts", function() {
        assert.isAtLeast(accounts.length, 1);
        owner = accounts[ 0 ];
        return makeSureAreUnlocked([ owner ]);
    });

    beforeEach("should deploy 2 implementations and a dispatcher", function() {
        return Counter.new({ from: owner })
            .then(implementation => {
                counterImpl = implementation;
                return DispatcherWrong.new(counterImpl.address, { from: owner });
            })
            .then(created => {
                dispatcher = created;
                // Now we create the "pretend" counter.
                counter = Counter.at(dispatcher.address);
            });
    });

    it("should have correct implementation counter", function() {
        return counterImpl.getCounter()
            .then(value => assert.strictEqual(value.toNumber(), 0))
            .then(() => counterImpl.increment({ from: owner }))
            .then(txObject => counterImpl.getCounter())
            .then(value => assert.strictEqual(value.toNumber(), 1));
    })

    it("should have 'Messed up' dispatched counter", function() {
        return counter.getCounter()
            .then(value => assert.strictEqual(
                web3.toUtf8("0x" + value.toString(16)),
                "Messed up"))
            .then(() => web3.eth.getStorageAtPromise(counter.address, 3))
            .then(value => assert.strictEqual(web3.toUtf8(value), "Messed up"));
    });
});