"use strict";

const assert = require("chai").assert;

module.exports = function(action, gasToUse) {
    return new Promise(
        (resolve, reject) => {
            try {
                resolve(action());
            } catch (e) {
                reject(e);
            }
        })
        .then(function(txObject) {
            // We are in Geth
            assert.equal(txObject.receipt.gasUsed, gasToUse, "should have used all the gas");
        })
        .catch(function(e) {
            if ((e + "").indexOf("invalid JUMP") > -1 || (e + "").indexOf("out of gas") > -1) {
                // We are in TestRPC
            } else if ((e + "").indexOf("please check your gas amount") > -1) {
                // We are in Geth for a deployment
            } else {
                throw e;
            }
        });
};  