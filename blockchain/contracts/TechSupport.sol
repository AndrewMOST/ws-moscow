// solium-disable linebreak-style
pragma solidity ^0.4.24;

import "./Moderator.sol";
import "./Application.sol";
import "./Events.sol";

contract TechSupport is Moderator, Application, Events {
    // Отправка заявки пользователем
    function submitApplication (
        string _name,
        string _email,
        string _phone,
        string _title,
        string _text
    ) public returns (uint _appId){
        // Количество заявок увеличивается на 1
        _appId = applicationNum++;
        // Новая заявка сохраняется в словарь заявок
        applications[_appId].user = msg.sender;
        applications[_appId].name = _name;
        applications[_appId].email = _email;
        applications[_appId].phone = _phone;
        applications[_appId].title = _title;
        applications[_appId].text = _text;

        // Вызываем событие создания контракта
        emit ApplicationCreated(msg.sender, _appId);
    }

    // Функция, редактирующая заявку
    function editApplication (
        uint256 _appId,
        string _name,
        string _email,
        string _phone,
        string _title,
        string _text
    ) public {
        // Исправить заявку может только ее создатель
        require(applications[_appId].user == msg.sender, "You can't edit this application!");
        // Заявка должна быть открыта
        require(!applications[_appId].status, "Application already closed!");
        // Исправленная заявка сохраняется в словарь заявок
        applications[_appId].name = _name;
        applications[_appId].email = _email;
        applications[_appId].phone = _phone;
        applications[_appId].title = _title;
        applications[_appId].text = _text;

        // Вызываем событие изменения заявки
        emit ApplicationEdited(msg.sender, _appId);
    }

    // Принятие заявки администратором
    function acceptApplication (uint256 _appId) public moderatorOnly {
        // Заявка с таким ID должна существовать
        require(_appId < applicationNum, "This application doesn't exist!");
        // Заявка должна быть открыта
        require(!applications[_appId].status, "Application already closed!");
        // На заявке не должно быть модератора
        require(applications[_appId].moderator == 0x0, "There already is a moderator!");
        // Связывает модератора с данной заявкой
        applications[_appId].moderator = msg.sender;

        // Вызываем событие принятия модератором заявки
        emit ApplicationAccepted(msg.sender, _appId);
    }

    // Отправка сообщения в чат заявки
    function sendMessage(
        uint256 _appId,
        string _text
    ) public {
        // Заявка с таким ID должна существовать
        require(_appId <= applicationNum, "This application doesn't exist!");

        // Сохраним заявку в переменную, чтобы каждый раз не вызывать
        ApplicationData storage _app = applications[_appId];

        // Заявка должна быть еще открыта
        require(!_app.status, "The application is already closed!");
        // Отправитель должен быть или пользователем,
        // отправившим заявку, или модератором,
        // рассматривающим ее
        require((_app.user == msg.sender)||(_app.moderator == msg.sender), "The application is not yours!");

        // Создадим объект сообщения и поместим его в ApplicationData
        senders[_appId][lastMessage[_appId]] = moderators[msg.sender];
        messages[_appId][lastMessage[_appId]++] = _text;

        // Вызываем событие отправки сообщения
        emit MessageSent(_appId);
    }

    // Закрытие заявки пользователем
    function closeApplication(uint256 _appId) public {
        // Заявка с таким ID должна существовать
        require(_appId <= applicationNum, "This application doesn't exist!");

        // Сохраним заявку в переменную, чтобы каждый раз не вызывать
        ApplicationData storage _app = applications[_appId];

        // Заявка должна быть еще открыта
        require(!_app.status, "The application is already closed!");
        // Отправитель должен быть пользователем,
        // отправившим заявку
        require(_app.user == msg.sender, "The application is not yours!");

        // Закрываем заявку
        _app.status = true;
    }

    // Оценивание работы над заявкой пользователем
    function rateApplication(uint8 _rating, uint256 _appId) public {
        // Заявка должна быть закрыта и еще не оценена
        require(applications[_appId].status && (!applications[_appId].rated), "You can't rate this!");
        // Оценка должна быть по 5-балльной шкале
        require(_rating > 0 && _rating < 6, "Incorrect rating!");

        // Обновим рейтинг модератора
        uint32 oldRating = (ratings[applications[_appId].moderator])*(ratingsAmount[applications[_appId].moderator]++);
        ratings[applications[_appId].moderator] = uint8((oldRating + _rating) / ratingsAmount[applications[_appId].moderator]);
    }
}