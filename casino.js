// Creating the web3 provider
var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

// Setting up the default account
// (which is contract deployment account)
var casinoAddr = "0x6B2Fb2DF3aE3b22B8A4842461231D7B0e556FFD3";

// Initializing the contract
var contractAddress = "0xaaFa19d6f354Eee368e0bc6ED0a418CC8bF49763";
var abi = "[{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"address\"}],\"name\":\"ones\",\"outputs\":[{\"name\":\"\",\"type\":\"int128\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"address\"}],\"name\":\"zeros\",\"outputs\":[{\"name\":\"\",\"type\":\"int128\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"secretRevealed\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"shaSubmitted\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"address\"}],\"name\":\"totalFlips\",\"outputs\":[{\"name\":\"\",\"type\":\"int128\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"casinosNumberRevealed\",\"outputs\":[{\"name\":\"\",\"type\":\"int64\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"constant\":false,\"inputs\":[{\"name\":\"_number\",\"type\":\"int64\"}],\"name\":\"sendCasinosNumber\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_hash\",\"type\":\"bytes32\"}],\"name\":\"attendInRound\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"revealNumber\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_number\",\"type\":\"int64\"}],\"name\":\"getResult\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]"
var coinFlip = new web3.eth.Contract(JSON.parse(abi), contractAddress);

// Sleep functions for iteration intervals
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function iterationBreak() {
    await sleep(200);
}

var numberGiven = false;

// Main cycle
const casinoLoop = async function(){
    // Check if we need to submit the number
    if(numberGiven){
        console.log("Game is already happening")
    }
    else {
        // Generate and send the number if it's not given
        var secretNumber = Math.floor(Math.random() * 500);
        coinFlip.methods.sendCasinosNumber(secretNumber).send({from: casinoAddr},function(error, result) {
            console.log("Number generated");
            numberGiven = true;
        });
    }

    // Check if player submitted the sha
    coinFlip.methods.shaSubmitted().call(function(error, result) {
        // If sha is submitted and we haven't revealed yet
        if(result){
            coinFlip.methods.revealNumber().send({from: casinoAddr}, function(error, result) {
                console.log(error);
            });
        }
    });
}

const mainLoop = async function(){
    while (true){
        await casinoLoop();
        await iterationBreak();
    }
}

mainLoop();
