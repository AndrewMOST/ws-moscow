var TechSupport = artifacts.require('TechSupport');

contract('Moderator', function(accounts) {

    // Переменная, хранящая контракт
    var contract;
    // Переменная, хранящая аккаунт создателя контракта
    var owner = accounts[0];

    // Создание нового instance контракта
    // перед вызовом каждого юнит-теста
    beforeEach(function() {
        return TechSupport.new({from: owner})
        .then(function(instance) {
            contract = instance;
        });
    });

    // Контракт должен инициализироваться с нужным
    // аккаунтом администратора
    it('should be able to correctly set admin', function() {
        return contract.admin().then(function(result) {
            assert.equal(result, accounts[0]);
        });
    });

    // Главный администратор должен уметь добавлять модераторов
    it('admin should be able to set moderators', function() {
        return contract.changeModerator(1, accounts[1], {from: accounts[0]}).then(function() {
            return contract.moderators.call(accounts[1], {from: accounts[0]}).then(function(result) {
                assert.equal(result, true);
            });
        });
    });

});