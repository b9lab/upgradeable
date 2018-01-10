"use strict";

const Dispatcher = artifacts.require("./Dispatcher.sol");
const Failer = artifacts.require("./Failer.sol");
const expectedException = require("../utils/expectedException.js");
const makeSureAreUnlocked = require("../utils/makeSureAreUnlocked.js");
Promise.allSequential = require("../utils/sequentialPromise.js");

contract("Dispatcher with Failer", function(accounts) {
    let owner, failerImpl, dispatcher, failer;

    before("should prepare accounts", function() {
        assert.isAtLeast(accounts.length, 1);
        owner = accounts[ 0 ];
        return makeSureAreUnlocked([ owner ]);
    });

    beforeEach("should deploy an implementation and a dispatcher", function() {
        return Failer.new({ from: owner })
            .then(implementation => {
                failerImpl = implementation;
                return Dispatcher.new(failerImpl.address, { from: owner });
            })
            .then(created => {
                dispatcher = created;
                // Now we create the "pretend" failer.
                failer = Failer.at(dispatcher.address);
            });
    });

    it("should have revert in implementation", function() {
        return expectedException(
            () => failerImpl.failMe({ from: owner, gas: 3000000 }),
            3000000);
    })

    it("should work by forwarding revert", function() {
        return expectedException(
            () => failer.failMe({ from: owner, gas: 3000000 }),
            3000000);
    });
});