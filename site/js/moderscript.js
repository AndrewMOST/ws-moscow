console.log('Чтобы начать работу, введите help()');
function help(){
    console.log('Зарегистрируйтесь или войдите по логину и паролю!\nregister("Пример пароля")\nlogin("Ваш логин", "Ваш пароль")');
}

// Получить и вывести все заявки
function getapplications(){
    $.post('/getapps_moderator', {moderator: window.localStorage.login})
        .done(function (data){
            console.log(data);
            $('#available > ul, #taken > ul').html('');
            if (data.length === 0){
                $('#available > ul').html('<p>Пока что нет заявок');
                $('#taken > ul').html('<p>Вы не взяли ни одной заявки');
                return false;
            }

            avalible = [];
            taken = [];
            data.forEach(el => {
                if (el["0"] === false){
                    $('#available > ul').prepend(`<li class="collection-item"><div>${el["5"]}<a href="javascript:take_app(${el.id})" class="secondary-content"><i class="material-icons">done</i></a></div></li>`);
                }
                else{
                    $('#taken > ul').prepend(`<a class="collection-item" href="/moder/apps/${el.id}"><div>${el["5"]}</div></a>`);
                }
            })
            if (available.length === 0){$('#available > ul').html('<p>Пока что нет заявок');}
            if (taken.length === 0){$('#taken > ul').html('<p>Вы не взяли ни одной заявки');}
        });
}

function take_app(id){
    $.post('/take_app', {moderator: window.localStorage.login, id: id}).done(
        (data) => {
            getapplications();
        }
    )
}
// Получить данные заявки
function get_app_data(){
    $.post('/get_app_data', {login: window.localStorage.login, id: document.location.pathname.replace('/moder/apps/', '')})
        .done(function (data){
            console.log(data);

            $('#title').val(data["4"]);
            $('#text').val(data["5"]);
            $('#data').html(
                `Имя: ${data["1"]}<br>Телефон: ${data["3"]}<br>Email: ${data["2"]}<br>`
            )

            if (data[0] === false){
                setInterval('get_chat()', 1000);
            }
            else{
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

    $.post('/send_message', {login: window.localStorage.login, id: document.location.pathname.replace('/moder/apps/', ''), text: message})
}