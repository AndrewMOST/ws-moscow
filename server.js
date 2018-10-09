var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var Web3 = require("web3");
var web3 = new Web3();
var MongoClient = require('mongodb').MongoClient;
var db;
var a;
const url = 'mongodb://Andrew:gaygay69@ds113923.mlab.com:13923/wsdatabase';


const path = require('path');

app.use(express.static(path.join(__dirname, 'client/build')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));





MongoClient.connect(url, { useNewUrlParser: true }, function(err, client){
    if (err){
        return console.log(err);
    }
    db = client.db('wsdatabase');
    app.listen(8000, function(){
        console.log('Server started')
    })
})





app.get('*', (req, res) =>{
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});


app.get('/flip', (req,res) =>{
    //Connect to BC server to get the side of the coin
    res.send(coinside)
});


app.get('/stat', (req,res) =>{
    //Connect to BC server to get the profile statistics
    res.send(stat)
});


app.post('/registration', function(req, res){

    password = req.body.password;
    function returnCredentials(password){
        privateKey = web3.eth.accounts.create().privateKey.substr(2)
        obj = web3.eth.accounts.privateKeyToAccount(privateKey);
        console.log(obj);
        return {password: password, address: obj.address, privatekey: obj.privateKey}
    }
    regdata = returnCredentials(password);
    res.send(regdata);

    db.collection('BCUsers').insert(regdata, function(err, result){
        if (err){
            console.log(err);
        }
    });
});


app.post('/login', function(req, res){
    var logdata = req.body;
    console.log(logdata);
    db.collection('BCUsers').findOne({address: logdata.address, password: logdata.password}, function(err, result){
        console.log(result);
        if (result === null){
            return res.send('false')
        }
        res.send('true')
    })

})

//Check