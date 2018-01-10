"use strict";

const Promise = require("bluebird");
const Dispatcher = artifacts.require("./Dispatcher.sol");
const CounterWrong = artifacts.require("./CounterWrong.sol");
const expectedException = require("../utils/expectedException.js");
const makeSureAreUnlocked = require("../utils/makeSureAreUnlocked.js");
Promise.allSequential = require("../utils/sequentialPromise.js");

if (typeof web3.eth.getBlockPromise !== "function") {
    Promise.promisifyAll(web3.eth, { suffix: "Promise" });
}

contract("Dispatcher with CounterWrong", function(accounts) {
    let owner, counterImpl, dispatcher, counter;

    before("should prepare accounts", function() {
        assert.isAtLeast(accounts.length, 1);
        owner = accounts[ 0 ];
        return makeSureAreUnlocked([ owner ]);
    });

    beforeEach("should deploy an implementation and a dispatcher", function() {
        return CounterWrong.new({ from: owner, gas: 3000000 })
            .then(implementation => {
                counterImpl = implementation;
                return Dispatcher.new(counterImpl.address, { from: owner, gas: 3000000 });
            })
            .then(created => {
                dispatcher = created;
                // Now we create the "pretend" counter.
                counter = CounterWrong.at(dispatcher.address);
            });
    });

    it("should have saved values in dispatcher's storage", function() {
        return web3.eth.getStorageAtPromise(counter.address, 0)
            .then(value => assert.strictEqual(
                web3.toBigNumber(value).toString(10),
                web3.toBigNumber(owner).toString(10)))
            // Slot 1 is the nonce for `mapping(bytes4 => uint) _sizes;`, so we skip it.
            .then(() => web3.eth.getStorageAtPromise(counter.address, 2))
            .then(value => assert.strictEqual(
                web3.toBigNumber(value).toString(10),
                web3.toBigNumber(counterImpl.address).toString(10)));
    });

    it("should have counter implementation working as expected", function() {
        return counterImpl.getCounter()
            .then(value => assert.strictEqual(value.toNumber(), 0))
            .then(() => web3.eth.getStorageAtPromise(counterImpl.address, 0))
            .then(value => assert.strictEqual(web3.toBigNumber(value).toNumber(), 0))
            .then(() => counterImpl.increment({ from: owner }))
            .then(txObject => counterImpl.getCounter())
            .then(value => assert.strictEqual(value.toNumber(), 1))
            .then(() => web3.eth.getStorageAtPromise(counterImpl.address, 0))
            .then(value => assert.strictEqual(web3.toBigNumber(value).toNumber(), 1));
    });

    it("should weirdly 'increment owner' when dispatched", function() {
        return counter.increment()
            .then(txObject => counter.getCounter())
            .then(value => assert.strictEqual(
                web3.toBigNumber(value).toString(10),
                // Yes, the owner + 1
                web3.toBigNumber(owner).plus(1).toString(10)))
            .then(txObject => web3.eth.getStorageAtPromise(counter.address, 0))
            .then(value => assert.strictEqual(
                web3.toBigNumber(value).toString(10),
                // Yes, the owner + 1
                web3.toBigNumber(owner).plus(1).toString(10)));
    });
});