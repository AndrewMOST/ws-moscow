// Скрипт для модераторского интерфейса и консоли
// Для началы работы нужно войти в систему или зарегистрироваться
// Команды консоли:
// get_apps() — получить заявки (доступные и взятые)
// get_app_byid(id заявки) — получить данные заявки
// take_app(id заявки) — получить данные заявки (располложена в другом месте)
// get_app_chat_byid(id заявки) — получить чат заявки
// send_message_byid("Ваше сообщение", id заявки) — отправить сообшение по id заявки
// quit() — выход из системы, очистка кэша и т. д.

// Инициализация консольного приложения для пользователя
console.log('Привет Админ!\nЧтобы начать работу, введите help()');
function help(){
    console.log(
        `Команды консоли:

get_apps() — получить заявки (доступные и взятые)
get_app_byid(id заявки) — получить данные заявки
take_app(id заявки) — получить данные заявки
get_app_chat_byid(id заявки) — получить чат заявки
send_message_byid("Ваше сообщение", id заявки) — отправить сообшение по id заявки
quit() — выход из системы, очистка кэша и т. д.`
    );
}

// Функция выхода из системы
function quit(){
    window.localStorage.login = '';
    document.location = "/";
}

// Получить и вывести все заявки
function getapplications(){
    $.post('/getapps_moderator_available', {moderator: window.localStorage.login})
        .done(function (data){
            $('#available > ul').html('');
            available = data;
            available.forEach(el => {
                if (el["0"] !== true){
                    $('#available > ul').prepend(`<li class="collection-item"><div>${el["4"]}<a href="javascript:take_app(${el.id})" class="secondary-content"><i class="material-icons">done</i></a></div></li>`);
                }
            })
            if (available.length === 0){$('#available > ul').html('<p>Пока что нет заявок');}
        }).then(function(){
            $.post('/getapps_moderator_taken', {moderator: window.localStorage.login})
                .done(function (data){
                    $('#taken > ul').html('');
                    taken = data;
                    taken.forEach(el => {
                        $('#taken > ul').prepend(`<a class="collection-item" href="/moder/apps/${el.id}"><div>${el["4"]}</div></a>`);
                    })
                    if (taken.length === 0){$('#taken > ul').html('<p>Вы не взяли ни одной заявки');}
                });
        });

    
}

// Получить данные заявки
function get_app_data(){
    $.post('/get_app_data', {login: window.localStorage.login, id: document.location.pathname.replace('/moder/apps/', '')})
        .done(function (data){
            $('#title').html('<br>' + data["4"]);
            $('#text').html(data["5"]);
            $('#data').html(
                `Имя: ${data["1"]}<br>Телефон: ${data["3"]}<br>Email: ${data["2"]}<br>`
            )

            if (data[0] === false){
                app = setInterval('get_app_data()', 5000);
                chat = setInterval('get_chat()', 1000);
            }
            else{
                get_chat();
                clearInterval(app);
                clearInterval(chat);
                $('#service, .input-chat, button').remove();
            }
        });
}

// Получить чат заявки
function get_chat(){
    $.post('/get_chat', {login: window.localStorage.login, id: document.location.pathname.replace('/moder/apps/', '')})
    .done(function (data){
        if (data[0] === undefined){
            $('.chat').html('Пока что нет ни одного сообщения!');
            return false;
        }
        html = '';
        for (i in data){
            element = data[i];
            if (element.sender == true){name = 'Я'; or = 'right'}
            else{name = 'Клиент'; or = 'left'}
            html += `<div class="text-message card-panel ${or}-message">
                        <span>${name}</span>
                        <p>${element.text}</p>
                    </div>`;
        }
        $('.chat').html(html);
    });
}

// Отправить сообщение
function send_message(message = ''){
    message = $('#message').val();
    if (message === ''){
        return false;
    }
    $('.chat').append(`<div class="text-message card-panel right-message">
                            <span>Я</span>
                            <p>${message}</p>
                        </div>`);
    $('#message').val('');
    $.post('/send_message', {login: window.localStorage.login, id: document.location.pathname.replace('/moder/apps/', ''), text: message})
}



// 
// 
// 
// Консольные команды
// 
// 
// 



// Получить и вывести все заявки console
function get_apps(){
    $.post('/getapps_moderator_available', {moderator: window.localStorage.login})
    .done(function (data){
        available = data;
        console.group('Доступные');
        ok = []
        available.forEach(el => {
            if (el["0"] !== true){
                ok.push(el)
            }
        })
        console.table(ok);
        if (ok.length === 0){console.log('Нет ни одной доступной заявки');}
        console.groupEnd();
    }).then(function(){
        $.post('/getapps_moderator_taken', {moderator: window.localStorage.login})
            .done(function (data){
                taken = data;
                console.group('Взятые');
                console.table(taken);
                if (taken.length === 0){console.log('Вы не взяли ни одной заявки')}
                console.groupEnd();
            });
    });
}

// Получить данные заявки console
function get_app_byid(id){
    $.post('/get_app_data', {login: window.localStorage.login, id: id})
        .done(function (data){
            console.table([{title: data["4"], name: data["1"], email:data["2"],text:data["5"],phone:data["3"]}])
        });
}


// Получить чат заявки console
function get_app_chat_byid(id){
    $.post('/get_chat', {login: window.localStorage.login, id: id})
        .done(function (data){
            if (data[0] === undefined){
                console.log('Пока что нет ни одного сообщения!');
                return false;
            }
            html = '';
            for (i in data){
                element = data[i];
                if (element.sender == false){name = 'Клиент'; or = 'right'}
                else{name = 'Я'; or = 'left'}
                html += `${name}: ${element.text}\n`;
            }
            console.log(html);
        });
}

// Отправить сообщение console
function send_message_byid(message = '', id){
    if (message === ''){
        return false;
    }
    if (message.length > 200){
        console.log('Слишком длинное сообщение');
        return false;
    }
    else{
        $.post('/send_message', {login: window.localStorage.login, id: id, text: message}).done(()=>{console.log('Сообщение отправлено!')}).fail(()=>{console.log('Заявка уже закрыта!')})
    }
}