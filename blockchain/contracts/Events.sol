// solium-disable linebreak-style
pragma solidity ^0.4.24;

// Контракт, содержащий все события,
// имитируемые смарт-контрактом
contract Events {
    // Событие создания заявки
    event ApplicationCreated (address _creator, uint256 _appId);
    // Событие изменения заявки
    event ApplicationEdited (address _creator, uint256 _appId);
    // Событие принятия заявки
    event ApplicationAccepted (address _moderator, uint256 _appId);
    // Событие отправки сообщения
    event MessageSent (uint256 _appId);
    // Событие закрытия заявки
    event ApplicationClosed (uint256 _appId);
}