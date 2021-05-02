const {Router} = require('express');
const User = require('../models/user');
const router = new Router();

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true
    });
});

router.post('/login', async (req, res) => {
    const user = await User.findById('608d5a4fd0e5081d74ffc033');
    req.session.user = user;
    req.session.isAuthenticated = true;
    req.session.save(err => {
        if(err) throw err;
        res.redirect('/');
    });
});

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});

module.exports = router;