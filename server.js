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

app.get('/createapp', function(req, res){
    res.sendFile(path.join(__dirname+'/site/createapplication.html'));
});

//Post-запрос на создание новой заявки,сохраняющий JSON заявки в коллекцию заявок базы данных
app.post('/createapp', function(req, res){
    appdata = req.body;
    json_data = {title: appdata.title, name: appdata.name, phone: appdata.phone, status: 0, id_user: localStorage.login, id_moder: ''}
    db.collection('appscollection').insertOne(appdata, function(err, result){
        if (err){
            return console.log(err)
        }
        res.send('<script>document.location = "/user"</script>');
    })
});

//Post-запрос на получение информации об оставленных пользователем заявках.
//Ищет заявки в базе по ключу пользователя, отправившего запрос.
app.post('/getapps_user', function(req, res){
    appdata = req.body;
    applics = []
    // function createresponse(){
    //     var applic = {};
    //     db.collection('appscollection').findOne({login: appdata.login, status: '1'}, function(err, result){
    //         if (err){
    //             return console.log(err)
    //         }
    //         console.log(result);
    //         applic["opened"] = result;
    //     })
    //     db.collection('appscollection').findOne({login: appdata.login, status: '0'}, function(err, result){
    //         if (err){
    //             return console.log(err)
    //         }
    //         applic["closed"] = result;
    //     })
    //     return applic;
    // };
    res.send(
        {
        "closed": [{ _id: '5bbdfbe5b9251f3340a372f4',
            login: '0x5C88752f11aD9f442c74C4cae3D1d9613C4F92c2',
            question: 'Почему моя стиральная машина не работает?',
            email: 'sas@sos.sis',
            status: '1', id: 0 }], 
        "opened": [{ _id: '5bbdfbd2b9251f3340a372f3',
            login: '0x5C88752f11aD9f442c74C4cae3D1d9613C4F92c2',
            question: 'Почему мой телефон не работает?',
            email: 'sas@sos.sis',
            status: '0', id: 1 }]
        });
    // applics.push(result);
    // console.log('your applications are: '+applics);

});

app.post('/getchat', function(req, res){
    appdata = req.body;
    //Send a request and get the current chat from BC!!
    chat = [{num: 0, sender: 0, text: "Почему моя стиральная машина не работает?"}, {num: 1, sender: 1, text: "Хз вообще"}, {num: 2, sender: 0, text: "Это техподдержка?"}, {num: 3, sender: 1, text: "Нет, это прачечная"}, {num: 4, sender: 0, text: "Вы что там, охренели что ли!?"}];
    res.send(chat);
});

app.get('/user/apps/:id', function(req, res){
    res.sendFile(path.join(__dirname+'/site/application.html'));
});

app.post('/get_app_data', function(req, res){
    appdata = req.body;

    db.collection('appscollection').findOne({id: appdata.id}, function(err, result){
        console.log(result);
        if (err){
            return console.log(err)
        }
        if (result.login !== appdata.login){
            res.send('false');
        }
        //Instead of sending result you need to ask BC for info by the app ID
        res.send(result);
    })
});





//Check