console.log('Чтобы начать работу, введите help()');
function help(){
    console.log('Зарегистрируйтесь или войдите по логину и паролю!\nregister("Пример пароля")\nlogin("Ваш логин", "Ваш пароль")');
}

// Получить и вывести все заявки
function getapplications(){
    $.post('/getapps_user', {login: window.localStorage.login})
        .done(function (data){
            console.log(data);
            for i in data{
                rez =   
            }
        });

    $('#datablock').html('');
}
