var TechSupport = artifacts.require('TechSupport');

contract('TechSupport', function(accounts) {

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

    // Контракт должен уметь создавать заявки
    // и возвращать данные о них
    it('should be able to create applications & get their titles', function() {
        return contract.submitApplication(
            "Test Username",
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

    // Контракт должен уметь редактировать созданные заявки
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