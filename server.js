var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var Web3 = require("web3");
var web3 = new Web3();
var MongoClient = require('mongodb').MongoClient;
var db;
const url = 'mongodb://169.254.3.88:27017/mydb';


const path = require('path');

app.use(express.static(path.join(__dirname, 'site/')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Подключение к MongoDB, прослушивание локалхоста
MongoClient.connect(url, { useNewUrlParser: true }, function(err, client){
    if (err){
        return console.log(err);
    }
    db = client.db('wsdatabase');
    app.listen(5000, function(){
        console.log('Server started');
        ///db.collection('appscollection').deleteMany({});
        db.collection('BCUsers').findOne({}, function(err, result){
            console.log(result)
        });
        db.collection('appscollection').findOne({status: '0'}, function(err, result){
            console.log(result)
        });
        db.collection('appscollection').findOne({status: '1'}, function(err, result){
            console.log(result)
        })

    })
});


//Базовый Get-запрос, возвращающий домашнюю страницу приложения
app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname+'/site/index.html'));
});


//Post-запрос регистрации, генерирующий кошелек и сохраняющий в Mongo данные кошелька и пароль пользователя для приложения.
// По такому запросу в систему можно зарегистрировать только пользователя, но не модератора.
app.post('/signup', function(req, res){
    password = req.body.password;
    function returnCredentials(password){
        //Регистрация кошелька с помощью Web3
        privateKey = web3.eth.accounts.create().privateKey.substr(2)
        obj = web3.eth.accounts.privateKeyToAccount(privateKey);
        console.log(obj);
        return {password: password, address: obj.address, privatekey: obj.privateKey, role: '0'}
    }
    regdata = returnCredentials(password);
    res.send(regdata);

    db.collection('BCUsers').insertOne(regdata, function(err, result){
        //Сохранение данных пользователя в базу
        if (err){
            return console.log(err);
        }
    });
});

//Post-запрос на вход в систему, проверяющий наличие пользователя с введенными логином и паролем в базе.
//Сервер возвращает логическую переменную правильности данных и статус пользователя - пользователь/модератор.
app.post('/signin', function(req, res) {
    var logdata = req.body;
    db.collection('BCUsers').findOne({address: logdata.login,password: logdata.password}, function (err, result) {
        console.log(result);
        if (result === null) {
            return res.send('false')
        }
        res.send({role: result.role, check: true})
    })
})


//Запросы возвращающие страницы с функционалами пользователя и модератора соответственно.
app.get('/user', (req, res) =>{
    res.sendFile(path.join(__dirname+'/site/mainu.html'));
});

app.get('/moder', (req, res) =>{
    res.sendFile(path.join(__dirname+'/site/mainm.html'));
});


//Post-запрос на создание новой заявки,сохраняющий JSON заявки в коллекцию заявок базы данных
app.post('/createapp', function(req, res){
    appdata = req.body;
    db.collection('appscollection').insertOne(appdata, function(err, result){
        if (err){
            return console.log(err)
        }
        res.sendStatus(200);
        //res.sendFile(path.join(__dirname+'/site/mainu.html'))
    })
});

//Post-запрос на получение информации об оставленных пользователем заявках.
//Ищет заявки в базе по ключу пользователя, отправившего запрос.
app.post('/getapps_user', function(req, res){
    appdata = req.body;
    db.collection('appscollection').findOne({login: appdata.login, status: '1'}, function(err, result){
        if (err){
            return console.log(err)
        }
        res.send(result)
    })
});


//Check