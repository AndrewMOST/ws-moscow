var CoinFlip = artifacts.require('CoinFlip');

var abi = require('ethereumjs-abi');
var BN = require('bn.js');

contract('CoinFlip', function(accounts) {

    var contract;
    var owner = accounts[0];

    beforeEach(function() {
        return CoinFlip.new({from: owner})
        .then(function(instance) {
            contract = instance;
        });
    });

    it('should be able to flip the coin', function() {
        var casinoNumber = Math.floor(Math.random() * 500);
        var playerNumber = Math.floor(Math.random() * 500);

        // Casino sends the "generated secret number"
        return contract.sendCasinosNumber(casinoNumber, {from: accounts[0]}).then(function() {
            // Player attends by sending the sha3(playerNumber, playerAddress)
            return contract.attendInRound(
                "0x"+abi.soliditySHA3(
                    [ "int64", "address"],
                    [ playerNumber, new BN(accounts[1].slice(2), 16)]
                ).toString('hex'),
                {from: accounts[1]}
                ).then(function() {
                // Casino reveals the number
                return contract.revealNumber({from: accounts[0]}).then(function() {
                    // Player gets the result!
                    return contract.getResult(playerNumber, {from: accounts[1]}).then(function() {
                        // Let's see if result is here
                        return contract.totalFlips.call(accounts[1]).then(function(result) {
                            // Check if the game's tracked
                            assert.equal(result.toNumber(), 1, "Game not tracked");
                        });
                    });
                });
            });
        });
    });

    it('should be able to track wins and losses', function() {
        var casinoNumber = Math.floor(Math.random() * 500);
        var playerNumber = Math.floor(Math.random() * 500);

        // Casino sends the "generated secret number"
        return contract.sendCasinosNumber(casinoNumber, {from: accounts[0]}).then(function() {
            // Player attends by sending the sha3(playerNumber, playerAddress)
            return contract.attendInRound(
                "0x"+abi.soliditySHA3(
                    [ "int64", "address"],
                    [ playerNumber, new BN(accounts[1].slice(2), 16)]
                ).toString('hex'),
                {from: accounts[1]}
                ).then(function() {
                // Casino reveals the number
                return contract.revealNumber({from: accounts[0]}).then(function() {
                    // Player gets the result!
                    return contract.getResult(playerNumber, {from: accounts[1]}).then(function() {
                        // Check if the result is right
                        if(casinoNumber > playerNumber){
                            return contract.zeros.call(accounts[1]).then(function(result) {
                                assert.equal(result.toNumber(), 1, "Wrong result");
                            });
                        }
                        else {
                            return contract.ones.call(accounts[1]).then(function(result) {
                                assert.equal(result.toNumber(), 1, "Wrong result");
                            });
                        }
                    });
                });
            });
        });
    });
});