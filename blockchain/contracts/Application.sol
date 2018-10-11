// solium-disable linebreak-style
pragma solidity ^0.4.24;

contract Application {
    // Структура, репрезентующая данные,
    // хранящиеся в заявке
    struct ApplicationData {
        // Статус заявки
        // 0 - открыта, 1 - закрыта
        bool status;

        // Оценена ли заявка на данный момент
        bool rated;

        // Пользователь, оптравивший заявку
        address user;
        // Модератор, просмартивающий заявку
        // (0x, если заявку еще не взял ни один модератор)
        address moderator;

        // Имя заявителя
        string name;
        // Электронная почта заявителя
        string email;
        // Телефон заявителя
        string phone;

        // Заголовок заявки
        string title;
        // Текст заявки
        string text;
    }

    // Словарь, хранящий все заявки системы
    mapping(uint256 => ApplicationData) applications;
    // Номер последней поданной заявки
    uint256 public applicationNum;

    // Хранение всех чатов системы

    // Номер последнего сообщения
    mapping(uint256 => uint32) lastMessage;
    // Словарь всех сообщений
    mapping(uint256 => mapping (uint32 => string)) messages;
    // Словарь отправителей
    mapping(uint256 => mapping(uint32 => bool)) senders;

    // Получаем название заявки
    function getAppTitle(uint256 _appId) public view returns(string _title){
        _title = applications[_appId].title;
    }

    // Получаем информацию о заявке
    function getAppData(uint256 _appId) public view returns(bool, string, string, string, string, string){
        ApplicationData memory _app = applications[_appId];
        return(_app.status, _app.name, _app.email, _app.phone, _app.title, _app.text);
    }

    // Получаем данные чата заявки
    function getChatData(uint256 _appId) public view returns(uint32) {
        // Возьмем нужную заявку
        ApplicationData memory _app = applications[_appId];
        // Смотреть могут только участники заявки
        require((_app.user == msg.sender)||(_app.moderator == msg.sender), "The application is not yours!");
        return lastMessage[_appId];
    }

    // Получаем сообщение заявки
    function getChatMessage(uint256 _appId, uint32 _lastMessage) public view returns(bool, string) {
        // Возьмем нужную заявку
        ApplicationData memory _app = applications[_appId];
        // Смотреть могут только участники заявки
        require((_app.user == msg.sender)||(_app.moderator == msg.sender), "The application is not yours!");
        return (senders[_appId][_lastMessage], messages[_appId][_lastMessage]);
    }
}