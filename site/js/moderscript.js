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
    $.post('/getapps_moderator_available', {moderator: window.localStorage.login})
        .done(function (data){
            $('#available > ul').html('');
            avalible = data;
            avalible.forEach(el => {
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

            $('#title').html('<br>' + data["4"]);
            $('#text').html(data["5"]);
            $('#data').html(
                `Имя: ${data["1"]}<br>Телефон: ${data["3"]}<br>Email: ${data["2"]}<br>`
            )

            if (data[0] === false){
                setInterval('get_app_data()', 5000);
                setInterval('get_chat()', 1000);
            }
            else{
                get_chat();
                clearInterval(0);
                clearInterval(1);
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