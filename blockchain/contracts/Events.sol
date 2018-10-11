// solium-disable linebreak-style
pragma solidity ^0.4.24;

// Контракт, содержащий все события,
// имитируемые смарт-контрактом
contract Events {
    event ApplicationCreated (address _creator, uint256 _appId);
    event ApplicationEdited (address _creator, uint256 _appId);
    event ApplicationAccepted (address _moderator, uint256 _appId);
    event MessageSent (uint256 _appId);
    event ApplicationClosed (uint256 _appId);
}