// solium-disable linebreak-style
pragma solidity ^0.4.24;

contract Application {
    // Структура, репрезентующая сообщение
    // в чате между пользователем и модератором
    struct Message {
        // Отправитель
        // 0 - пользователь, 1 - админ
        bool sender;
        // Текст сообщения
        string text;
    }

    // Структура, репрезентующая чат
    // между пользователем и модератором
    struct Chat {
        // Номер последнего сообщения
        uint32 lastMessage;
        // Словарь всех сообщений
        mapping(uint32 => Message) messages;
    }

    // Структура, репрезентующая данные,
    // хранящиеся в заявке
    struct ApplicationData {
        // Статус заявки
        // 0 - открыта, 1 - закрыта
        bool status;

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
        // Чат данной заявки
        Chat chat;
    }

    // Словарь, хранящий все заявки системы
    mapping(uint256 => ApplicationData) applications;
    // Номер последней поданной заявки
    uint256 public applicationNum;

    function getAppTitle(uint256 _appId) public view returns(string _title){
        _title = applications[_appId].title;
    }
}