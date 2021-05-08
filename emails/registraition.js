
const keys = require('../keys/index');

module.exports = function(email) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: "Ваш аккаунт успешно создан",
        html: `
            <h1>Добро пожаловать в наш магазин</h1>
            <p>Теперь вы можете преобрести у нас курсы под адресом ${email}</p>
            <hr/>
            <a href="${keys.BASE_URL}">Наш магазин</a>
        `
    };
}