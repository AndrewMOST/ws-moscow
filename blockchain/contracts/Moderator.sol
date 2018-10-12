// solium-disable linebreak-style
pragma solidity ^0.4.24;

// Контракт, управляющий правами доступа
// к функциям только для модраторов и
// рейтингом модераторов
contract Moderator {
    // Проверка, является ли пользователь модератором:
    // Если значение от адреса 1, то является
    // Если 0 - не является
    mapping(address => bool) public moderators;

    // Главный администратор, добавляющий и удаляющий модераторов
    address public admin;

    // Конструктор контракта, задающий администратором деплоера контракта
    constructor() public {
        admin = msg.sender;
        moderators[msg.sender] = true;
    }

    // Функция, позволяющая админу удалять и добавлять администраторов
    function changeModerator(bool _isModerator, address _addr) public{
        require(msg.sender == admin, "You don't have permission for it!");
        moderators[_addr] = _isModerator;
    }

    // Модификатор, позволяющий выполнять функцию
    // только модераторам
    modifier moderatorOnly() {
        require(moderators[msg.sender], "You don't have permission for it!");
        _;
    }

    // Словарь количества оценок модератора
    mapping(address => uint32) public ratingsAmount;

    // Словарь рейтинга модераторов
    mapping(address => uint8) public ratings;
}