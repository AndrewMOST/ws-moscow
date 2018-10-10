var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var Web3 = require("web3");
var web3 = new Web3();
var MongoClient = require('mongodb').MongoClient;
var db;
var a;
const url = 'mongodb://169.254.3.88:27017/mydb';


const path = require('path');

app.use(express.static(path.join(__dirname, 'site/')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));





MongoClient.connect(url, { useNewUrlParser: true }, function(err, client){
    if (err){
        return console.log(err);
    }
    db = client.db('wsdatabase');
    app.listen(8000, function(){
        console.log('Server started');
        console.log(db)
    })
})





app.get('*', (req, res) =>{
    res.sendFile(path.join(__dirname+'/site/index.html'));
});


app.get('/flip', (req,res) =>{
    //Connect to BC server to get the side of the coin
    res.send(coinside)
});


app.get('/stat', (req,res) =>{
    //Connect to BC server to get the profile statistics
    res.send(stat)
});


app.post('/signup', function(req, res){

    password = req.body.password;
    function returnCredentials(abcde){
        privateKey = web3.eth.accounts.create().privateKey.substr(2)
        obj = web3.eth.accounts.privateKeyToAccount(privateKey);
        console.log(obj);
        return {address: obj.address, privatekey: obj.privateKey}
    }
    regdata = returnCredentials(password);
    res.send(regdata);

    db.collection('BCUsers').insertOne(regdata, function(err, result){
        if (err){
            console.log(err);
        }
    });
});


app.post('/signin', function(req, res){
    var logdata = req.body;
    ///console.log(logdata);
    db.collection('BCUsers').findOne({address: logdata.address, password: logdata.password}, function(err, result){
        console.log(result);
        if (result === null){
            return res.send('false')
        }
        res.send('true')
    })

})

//Check