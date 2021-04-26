const {Router} = require('express');
const router = new Router();


router.get('/', (req, res) => {
    res.status(200);
    res.render('index', {
        title: "Главная страница",
        isHome: true
    });
});


module.exports = router;