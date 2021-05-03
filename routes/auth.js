const {Router} = require('express');
const User = require('../models/user');
const router = new Router();
const bcrypt = require('bcryptjs');

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true
    });
});

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const candidate = await User.findOne({email});

        if(candidate){
            const areSame = await bcrypt.compare(password, candidate.password);

            if(areSame){
                req.session.user = candidate;
                req.session.isAuthenticated = true;
                req.session.save(err => {
                    if(err) throw err;
                    res.redirect('/');
                });
            }
            else{
                res.redirect('/auth/login#login');
            }
        }
        else{
            res.redirect('/auth/login#login');
        }
    } catch (error) {
        console.log(error);
    }
});

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});

router.post('/register', async (req, res) => {
    try {
        const {name, email, password, repeat} = req.body;
        
        const candidate = await User.findOne({email});

        if(candidate){
            res.redirect('/auth/login#register');
        }
        else{
            const hashPssword = await bcrypt.hash(password, 10);
            const user = new User({
                name,
                email, 
                password: hashPssword,
                cart: {}
            });
            await user.save();
            res.redirect('/auth/login#login');
        }
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;