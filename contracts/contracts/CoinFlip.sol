// solium-disable linebreak-style
pragma solidity ^0.4.23;

/// @title Coin flip contract
contract CoinFlip {
    // How this contract basically works is:
    // There's casino (or gamemaster) (which is a locally ran program)
    // which submits a random number in the beginning of the round.
    // Then the player has to submit to the contract:
    // sha3(N, msg.sender) where N is the number generated.
    // Then the casino's number is revealed and the player has
    // to reveal N as well. If N is bigger than casino's number,
    // the outcome is 1. If less - 0. The proof that the number
    // submitted by player after the round equals N is that
    // sha3(revealed_number, msg.sender) must be equal to
    // sha3(N, msg.sender) which is already in the contract.

    /// @dev The address which submits randomly initialized
    address private casino;

    /// @dev Constructor sets the casino's address to contract
    /// creator's address
    constructor() public{
        casino = msg.sender;
    }

    /// @dev Where sha3(N, msg.sender) is stored
    mapping(address => bytes32) hashes;

    /// @dev The secret number submitted by casino
    int64 private casinosNumber;

    /// @dev The secret casino number after reveal
    int64 public casinosNumberRevealed;

    /// @dev Flag if user's sha3(N, msg.sender) is submitted
    bool public shaSubmitted;

    /// @dev Flag if casino's number is revealed
    bool public secretRevealed;

    /// @dev Modifier for casino-only functions
    modifier onlyCasino() {
        require(msg.sender == casino, "You're not allowed to do that!");
        _;
    }

    /// @dev Initializes casino's secret number
    function sendCasinosNumber(int64 _number) public onlyCasino {
        casinosNumber = _number;
        secretRevealed = false;
    }

    /// @dev Player sends sha3(N, msg.sender)
    function attendInRound(bytes32 _hash) public {
        hashes[msg.sender] = _hash;
        shaSubmitted = true;
    }

    /// @dev The casino reveals the number
    function revealNumber() public onlyCasino {
        /// @dev Can't reveal number before player
        /// had taken part in the flip
        require(shaSubmitted == true, "Player not ready yet!");
        casinosNumberRevealed = casinosNumber;
        secretRevealed = true;
    }

    /// @dev Player's coinflip statistics
    mapping(address => int128) public totalFlips;
    mapping(address => int128) public ones;
    mapping(address => int128) public zeros;

    /// @dev Player actually gets the result
    function getResult(int64 _number) public{
        /// @dev Resets sha submitted flag
        shaSubmitted = false;

        /// @dev Checks if sha3(N, msg.sender) is equal to sent hash
        require(keccak256(abi.encodePacked(_number, msg.sender)) == hashes[msg.sender], "You cheater!");

        /// @dev Updates the statistics
        totalFlips[msg.sender] += 1;
        if(_number > casinosNumberRevealed){
            ones[msg.sender] += 1;
        }
        else{
            zeros[msg.sender] += 1;
        }
    }
}
