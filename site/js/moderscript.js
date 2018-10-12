console.log('Чтобы начать работу, введите help()');

function help(){
    console.log('Ниже представлен список комманд:\nget_app() — получить данные о заявках\nquit() — выйти\n');
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
// Получить и вывести все заявки console
function get_app(){
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
            console.log(available);
            if (available.length === 0){console.log('Нет ни одной доступной заявки');}
            console.groupEnd();
        }).then(function(){
            $.post('/getapps_moderator_taken', {moderator: window.localStorage.login})
                .done(function (data){
                    taken = data;
                    console.group('Активные');
                    console.table(taken);
                    if (taken.length === 0){console.log('Вы не взяли ни одной заявки')}
                    console.groupEnd();
                });
        });
}

// Получить данные заявки
function get_app_data(){
    $.post('/get_app_data', {login: window.localStorage.login, id: document.location.pathname.replace('/moder/apps/', '')})
        .done(function (data){
            // console.log(data);
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