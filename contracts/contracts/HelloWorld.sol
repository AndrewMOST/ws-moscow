pragma solidity ^0.4.23;

/// @title Say hello world to blockchain users!
contract HelloWorld {
    /// @dev Stores ones, who said "hello, world!"
    mapping(address => bool) public hello;

    /// @dev Says hello!
    function sayHello() public {
        hello[msg.sender] = true;
    }
}
