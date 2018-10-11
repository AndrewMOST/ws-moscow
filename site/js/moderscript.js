console.log('Чтобы начать работу, введите help()');
function help(){
    console.log('Зарегистрируйтесь или войдите по логину и паролю!\nregister("Пример пароля")\nlogin("Ваш логин", "Ваш пароль")');
}

// Получить и вывести все заявки
function getapplications(){
    $.post('/getapps_moder', {login: window.localStorage.login})
        .done(function (data){
            console.log(data);
            data.available.forEach(element => {
                $('#available > ul').prepend(`<li class="collection-item"><div>${element.question}<a href="javascript:take_app(${element.id})" class="secondary-content"><i class="material-icons">add</i></a></div></li>`);
            });
            data.taken.forEach(element => {
                $('#taken > ul').prepend(`<a class="collection-item" href="/moder/apps/${element.id}"><div>${element.question}</div></a>`);
            });
        });
}
function take_app(id){
    $.post('/take_app', {moderator: window.localStorage.login, id: id}).done(
        (data) => {
            console.log(data);
        }
    )
}
// Получить данные заявки
function get_app_data(){
    $.post('/get_app_data', {login: window.localStorage.login, id: document.location.pathname.replace('/user/apps/', '')})
        .done(function (data){
            console.log(data);
            $('#title').val(data.title);
            $('#name').val(data.name);
            $('#email').val(data.email);
            $('#text').val(data.text);
            $('#phone').val(data.phone);
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