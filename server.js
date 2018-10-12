var bcData = require('./blockchain-data');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var Web3 = require("web3");
var MongoClient = require('mongodb').MongoClient;
var db;
const url = 'mongodb://169.254.3.88:27017/mydb';

var web3 = new Web3(new Web3.providers.HttpProvider("http://169.254.225.127:8545"));
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

        //db.collection('appscollection').deleteMany({});
        db.collection('BCUsers').find({}).toArray(function(err, result){
            console.log(result)
        });

        db.collection('appscollection').find({}).toArray(function(err, result){
            console.log(result);
        });


        // db.collection('BCUsers').insertOne({address: '0x40A8bD68c4beed89a171e101C4464944A1D2f735', privatekey: '8fb9af9b738c4b9dc56caad9e313d93b3838dbfa8aec250955c09034f21d09df', role: '0', password: '123'}, function(err, result){
        //     if (err){
        //         return console.log(err);
        //     }
        // });
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

    // TODO: добавить хеширование паролей!!
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
    db.collection('appscollection').find({login: login}).toArray(function(error, result) {
        promises = [];
        ids = [];
        result.forEach(element => {
            promises.push(
                new Promise(function(resolve, reject) {
                    resolve(contract.methods.getAppData(element.id).call({from: login}));
                })
            );
            ids.push(element.id);
        });
        Promise.all(promises).then(function(values){
            for(i = 0; i < ids.length; ++i){
                values[i]['id'] = ids[i];
            }
            res.send(values);
        });
    });
});

// Post-запрос для отправки сообщений в чат
app.post('/send_message', function(req, res){
    // Получение данных из тела запроса
    var id = req.body.id;
    var login = req.body.login;
    var text = req.body.text;

    // Обращение к блокчейну
    contract.methods.sendMessage(id, text).send({from: login}).then(function(receipt){
        console.log(receipt.events);
        res.sendStatus(200);
    });
});

// Post-запрос для получения чата
app.post('/get_chat', function(req, res){
    // Получение данных из запроса
    var id = req.body.id;
    var login = req.body.login;
    chat = {};

    // Получение количества сообщений в чате
    contract.methods.getChatData(id).call({from: login}).then(function(result) {
        // Создание списка Promise'ов для получения сообщений
        var promises = [];
        for(var i = 0; i < result; ++i){
            promises.push(
                new Promise(function(resolve, reject){
                     resolve(contract.methods.getChatMessage(id, i).call({from:login}));
                })
            );
        }
        // Ожидание всех Promise'ов и сохранение
        // результатов их работы
        Promise.all(promises).then(function(values){
            for(var i = 0; i < result; ++i){
                chat[i] = {
                    sender: values[i]['0'],
                    text: values[i]['1']
                };
            }
            // Отправка данных на клиент
            res.send(chat);
        })
    });
});

app.get('/user/apps/:id', function(req, res){
    res.sendFile(path.join(__dirname+'/site/application.html'));
});

app.get('/moder/apps/:id', function(req, res){
    res.sendFile(path.join(__dirname+'/site/application_moder.html'));
});

app.post('/user/apps/:id', function(req, res){
    console.log(req.body);
    // Берем нужные данныеы из JSON'а запроса
    appdata = req.body;
    // Отправляем транзакцию в блокчейн
    contract.methods.editApplication(
        req.params.id,
        appdata.name,
        appdata.email,
        appdata.phone,
        appdata.title,
        appdata.text).send(
        {from: appdata.login, gas: 4000000}).then(function(receipt) {
            // Получаем результаты из блокчейна
            var result = receipt.events.ApplicationEdited.returnValues;

            // Записываем мета-данные в MongoDB
            var meta = {
                "login": appdata.login,
                "id": result._appId,
                "moderator": "0x0",
                "status": 0
            };
            res.send(`<script>document.location = '/user/apps/${req.params.id}'</script>`);
        });
});

// Post-запрос для получения данных о заявке
app.post('/get_app_data', function(req, res){
    // Чтение тела запроса
    var login = req.body.login;
    var appId = req.body.id;
    // Получение данных из блокчейна
    contract.methods.getAppData(appId).call({from: login}).then(function(result) {
        res.send(result);
    });
});

// Post-запрос для проверки, является ли пользователь модератором
app.post('/check_if_moder', function(req, res){ // TODO: БЧ
    data = req.data;
    db.collection('BCUsers').findOne({address: data.login}, function (err, result) {
        console.log(result);
        if (result.status === 0) {
            return res.send(false);
        }
        res.send(true);
    })
});

// Post-запрос для получения списка заявок
// готовых к модерации
app.post('/getapps_moderator_available', function(req, res){
    var moderator = req.body.moderator;
    // Получение всех заявок, принятых модератором
    db.collection('appscollection').find({moderator: '0x0'}).toArray(function(error, result) {
        // console.log(result);
        promises = [];
        ids = [];

        // Создание списка Promise'ов для получения
        // данных из блокчейна
        result.forEach(element => {
            promises.push(
                new Promise(function(resolve, reject) {
                    // console.log(element);
                    ids.push(element.id);
                    resolve(contract.methods.getAppData(element.id).call({from: moderator}));
                })
            );
        });
        // Разрешение Promise'ов и получение данных из блокчейна
        Promise.all(promises).then(function(values){
            for(i = 0; i < ids.length; ++i){
                values[i]['id'] = ids[i];
            }
            // console.log(ids);
            res.send(values);
        });
    });
});

// Post-запрос для получения списка заявок
// принятых модератором
app.post('/getapps_moderator_taken', function(req, res){
    var moderator = req.body.moderator;
    // Получение всех заявок, принятых модератором
    db.collection('appscollection').find({moderator: moderator}).toArray(function(error, result) {
        console.log(result);
        promises = [];
        ids = [];

        // Создание списка Promise'ов для получения
        // данных из блокчейна
        result.forEach(element => {
            promises.push(
                new Promise(function(resolve, reject) {
                    resolve(contract.methods.getAppData(element.id).call({from: moderator}));
                })
            );
            ids.push(element.id);
        });
        // Разрешение Promise'ов и получение данных из блокчейна
        Promise.all(promises).then(function(values){
            for(i = 0; i < ids.length; ++i){
                values[i]['id'] = ids[i];
            }
            res.send(values);
        });
    });
});

// Post-запрос для принятия заявки модератором
app.post('/take_app', function(req, res){
    appdata = req.body;
    var amount = 0;
    var rating = 0;
    contract.methods.ratingsAmount(appdata.moderator).call({from: appdata.moderator}).then(function(result){
        amount = result;
        contract.methods.ratings(appdata.moderator).call({from: appdata.moderator}).then(function(result){
            rating = result;
            if(rating < 3 && amount > 5){
                res.sendStatus(500);
            }
            else {
                contract.methods.acceptApplication(appdata.id).send({from: appdata.moderator}).then(function(){
                    db.collection('appscollection').findOneAndUpdate({id: appdata.id.toString()}, {$set: {moderator: appdata.moderator}});
                    res.sendStatus(200);
                })
            }
        });
    });
});

// Post-запрос для закрытия заявки пользователем
app.post('/close_app', function(req, res) {
    appdata = req.body;
    contract.methods.closeApplication(appdata.id).send({from: appdata.login}).then(function(){
        db.collection('appscollection').findOneAndUpdate({id: appdata.id.toString()}, {$set: {status: 1}});
        contract.methods.rateApplication(appdata.rating, appdata.id).send({from: appdata.login}).then(function(){
            res.sendStatus(200);
        });
    });
});

// Post-запрос для передачи пользователю прав модератора (только с паролем администратора)
app.post('/give_moderation', function(req, res){ // TODO: только для админов (пароль на дб)
    appdata = req.body;
    contract.methods.changeModerator(appdata.status, appdata.to).send({from: appdata.login}).then(function(){
        res.sendStatus(200);
    });
});
