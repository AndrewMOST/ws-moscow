var TechSupport = artifacts.require('TechSupport');

contract('Moderator', function(accounts) {

    var contract;
    var owner = accounts[0];

    beforeEach(function() {
        return TechSupport.new({from: owner})
        .then(function(instance) {
            contract = instance;
        });
    });

    it('should be able to correctly set admin', function() {
        return contract.admin().then(function(result) {
            assert.equal(result, accounts[0]);
        });
    });

    it('admin should be able to set moderators', function() {
        return contract.changeModerator(1, accounts[1], {from: accounts[0]}).then(function() {
            return contract.moderators.call(accounts[1], {from: accounts[0]}).then(function(result) {
                assert.equal(result, true);
            });
        });
    });

});