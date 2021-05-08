
const keys = require('../keys/index');

module.exports = function(email, token) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: "Восстановление пароля",
        html: `
            <h1>Вы забыли пароль</h1>
            <p>Если вы хотите восстановить пароль, то нажмите на ссылку ниже</p>
            <p><a href="${keys.BASE_URL}/auth/password/${token}">Восстановить пароль</a></p>
            <hr/>
            <a href="${keys.BASE_URL}">Наш магазин</a>
        `
    };
}