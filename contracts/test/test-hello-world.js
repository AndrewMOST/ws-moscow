var HelloWorld = artifacts.require('HelloWorld');

contract('HelloWorld', function(accounts) {

    var contract;
    var owner = accounts[0];

    beforeEach(function() {
        return HelloWorld.new({from: owner})
        .then(function(instance) {
            contract = instance;
        });
    });

    it('should be able to say "Hello, world!"', function() {
        return contract.sayHello({from: accounts[1]}).then(function() {
            return contract.hello.call(accounts[1]).then(function(flag) {
                assert.equal(flag, true, '"Hello, world!" wasnt said');
            });
        });
    });
});