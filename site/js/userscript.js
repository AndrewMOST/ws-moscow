console.log('Чтобы начать работу, введите help()');
function help(){
    console.log('Зарегистрируйтесь или войдите по логину и паролю!\nregister("Пример пароля")\nlogin("Ваш логин", "Ваш пароль")');
}

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

// Получить данные заявки
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

function close_app(){
    rating = $('#rating').val();
    console.log('Rating: ' + rating)
    $.post('/close_app', {login: window.localStorage.login, id: document.location.pathname.replace('/user/apps/', ''), rating: rating});
    document.location = '/user';
}