console.log('Чтобы начать работу, введите help()');
function help(){
    console.log('Зарегистрируйтесь или войдите по логину и паролю!\nregister("Пример пароля")\nlogin("Ваш логин", "Ваш пароль")');
}
// Регистрация
function register(password=false){
    $('#datablock').html('');
    if (!password){
        password = $('#new-password-input').val();
    }
    if (!password) {$('#new-password-input').addClass('invalid'); console.log('Введите пароль'); return false;}

    // Запрос к серверу на создание пользователя с данным паролем
    $.post('/signup', {password:password})
        .done(function (data){
            cred = `Login: ${data.address}<br>Password: ${password}<br>Возможно на кошельке нет эфира!`; 
            $('#datablock').html(cred); 
            credlog = `Login: ${data.address}\nPassword: ${password}\nВозможно на кошельке нет эфира!`; 

            console.log(credlog);
        });
    
}

// Авторизация
function login(login=false, password=false){
    if (!(login && password)){
        login = $('#login').val();
        password = $('#password').val();
    }
    if (login === '' || password === ''){
        console.log('Не введены логин или пароль');
        $('#login, #password').addClass('invalid');
        return false;
    }

    // Запрос к серверу на вход
    $.post('/signin', {login:login, password:password}).done(
        function (data){
            if (data === 'false'){
                console.log('Неверный логин или пароль');
                $('#login, #password').addClass('invalid');
            }
            else{
                console.log('Авторизация была произведена!');
                window.localStorage.login = login;
                if (data.role === '1'){document.location = 'moder';}
                else{document.location = 'user'}
            }
        }
    );
}