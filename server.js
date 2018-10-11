var bcData = require('./blockchain-data');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var Web3 = require("web3");
var MongoClient = require('mongodb').MongoClient;
var db;
const url = 'mongodb://169.254.3.88:27017/mydb';

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var contract = new web3.eth.Contract(JSON.parse(bcData.abi), bcData.techSupportAddress);

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
        // db.collection('BCUsers').deleteMany({});
        db.collection('BCUsers').findOne({}, function(err, result){
            console.log(result)
        });
        db.collection('appscollection').find({}, function(err, docs){
            db.collection('appscollection').findOne({} , function(err, result){
                console.log(result)
            })
        });
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
    console.log(regdata);
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

app.get('/createapp', function(req, res){
    res.sendFile(path.join(__dirname+'/site/createapplication.html'));
});

//Post-запрос на создание новой заявки,сохраняющий JSON заявки в коллекцию заявок базы данных
app.post('/createapp', function(req, res){
    // Берем нужные данныеы из JSON'а запроса
    appdata = req.body;

    // Отправляем транзакцию в блокчейн
    contract.methods.submitApplication(
        appdata.name,
        appdata.email,
        appdata.phone,
        appdata.title,
        appdata.text).send(
        {from: appdata.login, gas: 4000000}).then(function(receipt) {
            // Получаем результаты из блокчейна
            var result = receipt.events.ApplicationCreated.returnValues;

            // Записываем мета-данные в MongoDB
            var meta = {
                "login": appdata.login,
                "id": result._appId,
                "moderator": "0x0",
                "status": 0
            };
            console.log(meta);
            db.collection('appscollection').insertOne(meta, function(err, result){
                if (err){
                    return console.log(err)
                }
                res.send('<script>document.location = "/user"</script>');
            })
        });
});

//Post-запрос на получение информации об оставленных пользователем заявках.
//Ищет заявки в базе по ключу пользователя, отправившего запрос.
app.post('/getapps_user', function(req, res){
    var login = req.body.login;
    db.collection('appscollection').find({login: login}).toArray(function(error, result) { // TODO: разобраться с курсорами
        promises = [];
        result.forEach(element => {
            promises.push(
                new Promise(function(resolve, reject) {
                    resolve(contract.methods.getAppData(element.id).call({from: login}));
                })
            );
        });
        Promise.all(promises).then(function(values){
            res.send(values);
        });
    });
});

app.post('/send_message', function(req, res){
    var id = req.body.id;
    var login = req.body.login;
    var text = req.body.text;

    contract.methods.sendMessage(id, text).send({from: login}).then(function(receipt){
        console.log(receipt.events);
        res.sendStatus(200);
    });
});

app.post('/getchat', function(req, res){
    var id = req.body.id;
    var login = req.body.login;
    chat = {};
    contract.methods.getChatData(id).call({from: login}).then(function(result) {
        var promises = [];
        for(var i = 0; i < result; ++i){
            promises.push(
                new Promise(function(resolve, reject){
                     resolve(contract.methods.getChatMessage(id, i).call({from:login}));
                })
            );
        }
        Promise.all(promises).then(function(values){
            for(var i = 0; i < result; ++i){
                chat[i] = {
                    sender: values[i]['0'],
                    text: values[i]['1']
                };
            }
            res.send(chat);
        })
    });
});

app.get('/user/apps/:id', function(req, res){
    res.sendFile(path.join(__dirname+'/site/application.html'));
});

app.post('/get_app_data', function(req, res){
    appdata = req.body;

    // db.collection('appscollection').findOne({id: appdata.id}, function(err, result){
    //     console.log(result);
    //     if (err){
    //         return console.log(err)
    //     }
    //     if (result.login !== appdata.login && result.moderator !== appdata.login){
    //         res.send('false');
    //         return false;
    //     }
    //     res.send(result);
    // })
    res.send('false');
});

app.post('/check_if_moder', function(req, res){
    data = req.data;
    db.collection('BCUsers').findOne({address: data.login}, function (err, result) {
        console.log(result);
        if (result.status === 0) {
            return res.send(false);
        }
        res.send(true);
    })
});

app.post('/getapps_moder', function(req, res){
    appdata = req.body;
    res.send(
        {
            "taken": [{ _id: '5bbdfbe5b9251f3340a372f4',
                login: '0x5C88752f11aD9f442c74C4cae3D1d9613C4F92c2',
                question: 'Почему моя стиральная машина cос?',
                moderator: '0x52687269234897389279285793450',
                email: 'sas@sos.sis',
                status: '1', id: 0 }],
            "available": [{ _id: '5bbdfbd2b9251f3340a372f3',
                login: '0x5C88752f11aD9f442c74C4cae3D1d9613C4F92c2',
                moderator: '0x0',
                question: 'Почему мой телефон сас?',
                email: 'sas@sos.sis',
                status: '0', id: 1 }]
        })
});

app.post('/take_app', function(req, res){
    appdata = req.body;
    //Change status and moderator in BC
    db.collection('appscollection').findOneAndUpdate({id: appdata.id}, {$set: {moderator: appdata.moderator}})
    res.send(true);
});


//Check