var Web3 = require("web3");
var web3 = new Web3();
console.log(web3.isConnected);
privateKey = web3.eth.accounts.create().privateKey.substr(2);
console.log(privateKey)