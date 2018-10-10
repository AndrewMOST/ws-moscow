// Регистрация
function register(){
    $('#datablock').html('');
    password = $('#new-password-input').val();
    if (!password) {$('#new-password-input').addClass('invalid'); return false;}

    // Запрос к серверу на создание пользователя с данным паролем
    $.post('/signup', {password:password}).done(function (data){console.log(data); $('#datablock').html(`Login: ${data.address}<br>Password: ${password}`)});
}

// Авторизация
function login(){
    login = $('#login').val();
    password = $('#password').val();
    if (login === '' || password === ''){
        $('#login, #password').addClass('invalid');
        return false;
    }

    // Запрос к серверу на вход
    $.post('/signin', {login:login, password:password}).done(
        function (data){
            if (data.status === 'false'){
                $('#login, #password').addClass('invalid');
            }
            else{
                window.login = login;
                document.location = data.role;
            }
        }
    );
}