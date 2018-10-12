// solium-disable linebreak-style
pragma solidity ^0.4.24;

/*
    Этот контракт автоматически сгенерирован
    фреймворком Truffle и используется для
    миграции контрактов при их изменении,
    не используется на данном этапе
*/

contract Migrations {
    address public owner;
    uint public last_completed_migration;

    constructor() public {
        owner = msg.sender;
    }

    modifier restricted() {
        if (msg.sender == owner) _;
    }

    function setCompleted(uint completed) public restricted {
        last_completed_migration = completed;
    }

    function upgrade(address new_address) public restricted {
        Migrations upgraded = Migrations(new_address);
        upgraded.setCompleted(last_completed_migration);
    }
}
