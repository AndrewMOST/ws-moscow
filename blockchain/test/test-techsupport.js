var TechSupport = artifacts.require('TechSupport');

var abi = require('ethereumjs-abi');
var BN = require('bn.js');
var Web3 = require("web3");

contract('TechSupport', function(accounts) {

    var contract;
    var owner = accounts[0];

    beforeEach(function() {
        return TechSupport.new({from: owner})
        .then(function(instance) {
            contract = instance;
        });
    });

    it('should be able to create applications & get their titles', function() {
        return contract.submitApplication(
            "Alex",
            "test@test.test",
            "999-999",
            "I'm addicted to coding pls help",
            "There's actually no way to do it",
            {from: accounts[1]}
        ).then(function() {
            return contract.applicationNum().then(function(result){
                assert.equal(result, 1);
                return contract.getAppTitle(result-1).then(function(result) {
                    assert.equal(result, "I'm addicted to coding pls help");
                });
            });
        });
    });

    it('should be able to edit created applications', function() {
        return contract.submitApplication(
            "Alex",
            "test@test.test",
            "999-999",
            "I'm addicted to coding pls help",
            "There's actually no way to do it",
            {from: accounts[1]}
        ).then(function() {
            return contract.applicationNum().then(function(result){
                return contract.editApplication(
                    0,
                    "Andrew",
                    "nest@nest.nest",
                    "000-000",
                    "I'm addicted to gaming pls help",
                    "There's actually no way to do it",
                    {from: accounts[1]}
                ).then(function() {
                    return contract.getAppTitle(0).then(function(result) {
                        assert.equal(result, "I'm addicted to gaming pls help");
                    });
                })
            });
        });
    });
});