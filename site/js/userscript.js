// Скрипт для юзерского интерфейса и консоли
// Для началы работы нужно войти в систему или зарегистрироваться
// Команды консоли:
// get_apps() — получить заявки пользователя (закрытые и открытые)
// get_app_byid(id заявки) — получить данные заявки
// get_app_chat_byid(id заявки) — получить чат заявки
// create_app(title, name, phone, email, text) — создать заявку
// send_message_byid("Ваше сообщение", id заявки) — отправить сообшение по id заявки
// close_app_byid(rating(от 1 до 5), id заявки) — закрыть заявку
// quit() — выход из системы, очистка кэша и т. д.


// Инициализация консольного приложения для пользователя
console.log('Привет Пользователь!\nЧтобы начать работу, введите help()');
function help(){
    console.log(
        `Команды консоли:

get_apps() — получить заявки пользователя (закрытые и открытые)
get_app_byid(id заявки) — получить данные заявки
get_app_chat_byid(id заявки) — получить чат заявки
create_app(title, name, phone, email, text) — создать заявку
send_message_byid("Ваше сообщение", id заявки) — отправить сообшение по id заявки
close_app_byid(rating(от 1 до 5), id заявки) — закрыть заявку
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
    $.post('/getapps_user', {login: window.localStorage.login})
    .done(function (data){
        data.forEach(el => {
            if (el["0"] === false){
                $('#opened > ul').prepend(`<a class="collection-item" href="/user/apps/${el.id}"><div>${el["4"]}</div></a>`);
            }
            else{
                $('#closed > ul').prepend(`<a class="collection-item" href="/user/apps/${el.id}"><div>${el["4"]}</div></a>`);
            }
        })
    });
}

// Получить данные заявки и запустить обновление чата
function get_app_data(){
    $.post('/get_app_data', {login: window.localStorage.login, id: document.location.pathname.replace('/user/apps/', '')})
    .done(function (data){
        console.log(data);
        $('#title').val(data["4"]);
        $('#name').val(data["1"]);
        $('#email').val(data["2"]);
        $('#text').val(data["5"]);
        $('#phone').val(data["3"]);

        if (data[0] === false){
            setInterval('get_chat()', 1000);
        }
        else{
            $('input, textarea').attr('disabled', "true");
            get_chat()
            $('#service, .input-chat, button').remove();
        }

    });
}

// Получить чат заявки
function get_chat(){
    $.post('/get_chat', {login: window.localStorage.login, id: document.location.pathname.replace('/user/apps/', '')})
        .done(function (data){
            if (data[0] === undefined){
                $('.chat').html('Пока что нет ни одного сообщения!');
                return false;
            }
            html = '';
            for (i in data){
                element = data[i];
                if (element.sender == false){name = 'Я'; or = 'right'}
                else{name = 'Техподдержка'; or = 'left'}
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
        $('#message').addClass('invalid');
        return false;
    }
    $('.chat').append(`<div class="text-message card-panel right-message">
                            <span>Я</span>
                            <p>${message}</p>
                        </div>`);
    $('#message').val('');
    $.post('/send_message', {login: window.localStorage.login, id: document.location.pathname.replace('/user/apps/', ''), text: message})
}

// Закрытие заявки
function close_app(){
    rating = $('#rating').val();
    $.post('/close_app', {login: window.localStorage.login, id: document.location.pathname.replace('/user/apps/', ''), rating: rating});
    document.location = '/user';
}



//
//
//
// Консольные команды
//
//
//



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

// Закрытие заявки console
function close_app_byid(rating = 5, id){
    if (rating === undefined || id === ''){
        return false;
    }
    if(rating >= 1 && rating <= 5){
        $.post('/close_app', {login: window.localStorage.login, id: id, rating: rating});
    }
    else{
        console.log('Рейтинг от 1 до 5')
    }
}

// Получить и вывести все заявки console
function get_apps(){
    $.post('/getapps_user', {login: window.localStorage.login})
        .done(function (data){
            opened = [];
            cl = [];
            data.forEach(el => {
                if (el["0"] === false){
                    opened.push(el);
                }
                else if (el["0"] === true){
                    cl.push(el);
                }
            })

            if (opened.length === 0){
                console.log('Нет открытых заявок создайте новую!');
            }
            else{console.group('Открытые заявки');console.table(opened);console.groupEnd();}

            if (cl.length === 0){
                console.log('Нет закрытых заявок!');
            }else{console.group('Закрытые заявки');console.table(cl);console.groupEnd();}
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
                if (element.sender == false){name = 'Я'; or = 'right'}
                else{name = 'Техподдержка'; or = 'left'}
                html += `${name}: ${element.text}\n`;
            }
            console.log(html);
        });
}

// Создать заявку console
function createapp(title='',name='', phone='', text='', email=''){
    if(title === '' || name === '' || text === '' || email === '' || phone === ''){
        console.log('Ошибка при создании');
    }
    $.post('/createapp', {login: window.localStorage.login, title:title, name:name, phone:phone, text:text, email:email})
    .done(function (data){
        console.log('Заявка создана');
    }).fail(function (data){
        console.log('Ошибка при создании');
    });
}