console.log('Чтобы начать работу, введите help()');
function help(){
    console.log('Зарегистрируйтесь или войдите по логину и паролю!\nregister("Пример пароля")\nlogin("Ваш логин", "Ваш пароль")');
}

// Получить и вывести все заявки
function getapplications(){
    $.post('/getapps_user', {login: window.localStorage.login})
        .done(function (data){
            console.log(data);
            data.opened.forEach(element => {
                $('#opened > ul').prepend(`<a class="collection-item" href="/user/apps/${element.id}"><div>${element.question}</div></a>`);
            });
            data.closed.forEach(element => {
                $('#closed > ul').prepend(`<a class="collection-item" href="/user/apps/${element.id}"><div>${element.question}</div></a>`);
            });
        });
}
getapplications();