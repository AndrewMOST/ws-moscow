console.log('Чтобы начать работу, введите help()');
function help(){
    console.log('Зарегистрируйтесь или войдите по логину и паролю!\nregister("Пример пароля")\nlogin("Ваш логин", "Ваш пароль")');
}

// Получить и вывести все заявки
function getapplications(){
    $.post('/getapps_moder', {login: window.localStorage.login})
        .done(function (data){
            $('#available > ul, #taken > ul').html('');
            if (data.available.length === 0){$('#available > ul').html('<p>Пока что нет заявок');}
            if (data.taken.length === 0){$('#taken > ul').html('<p>Вы не взяли ни одной заявки');}
            data.available.forEach(element => {
                $('#available > ul').prepend(`<li class="collection-item"><div>${element.question}<a href="javascript:take_app(${element.id})" class="secondary-content"><i class="material-icons">done</i></a></div></li>`);
            });
            data.taken.forEach(element => {
                $('#taken > ul').prepend(`<a class="collection-item" href="/moder/apps/${element.id}"><div>${element.question}</div></a>`);
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
            $('#title').html(data.title);
            $('#text').html(data.text);
            $('#data').html(
                `Имя: ${data.name}<br>Телефон: ${data.phone}<br>Email: ${data.email}<br>`
            )
        });
}

// Получить чат заявки
function get_chat(){
    $.post('/get_chat', {login: window.localStorage.login, id: document.location.pathname.replace('/user/apps/', '')})
        .done(function (data){

            console.log(data);
            html = '';
            data.forEach(element => {
                html += `<div class="text-message card-panel left-message">
                            <span>${data.name}</span>
                            <p>${data.text}</p>
                        </div>`;
            });
                
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

    $.post('/send_message', {login: window.localStorage.login, id: document.location.pathname.replace('/user/apps/', ''), text: message})
}