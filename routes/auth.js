const {Router} = require('express');
const User = require('../models/user');
const router = new Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const keys = require('../keys/index');
const regEmail = require('../emails/registraition');
const resetEmail = require('../emails/reset');
const crypto = require('crypto');
const {validationResult} = require('express-validator');
const {registerValidators, loginValidators} = require('../utils/validators');


let transporter;
(async () => {
    let testEmailAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testEmailAccount.user,
            pass: testEmailAccount.pass,
        },
    });
})();

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError'),
        success: req.flash('success')
    });
});

router.post('/login', loginValidators, async (req, res) => {
    try {
        const {email, password} = req.body;
        const candidate = await User.findOne({email});

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            req.flash('loginError', errors.array()[0].msg);
            return res.status(422).redirect('/auth/login#login');
        }

        req.session.user = candidate;
        req.session.isAuthenticated = true;
        req.session.save(err => {
            if(err) throw err;
            res.redirect('/');
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});

router.post('/register', registerValidators, async (req, res) => {
    try {
        const {name, email, password} = req.body;

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            req.flash('registerError', errors.array()[0].msg);
            return res.status(422).redirect('/auth/login#register');
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email, 
            password: hashPassword,
            cart: {}
        });
        await user.save();
        res.redirect('/auth/login#login');
        const info = await transporter.sendMail(regEmail(email));
        console.log(info);

    } catch (error) {
        console.log(error);
    }
});

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Забыли пароль',
        isLogin: true,
        error: req.flash('error')
    });
});

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if(err) {
                req.flash('error', 'Что-то пошло не так, повторите попытку позже');
                return res.redirect('/auth/reset');
            }
            
            const token = buffer.toString('hex');
            const candidate = await User.findOne({email: req.body.email});

            if(candidate){
                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
                await candidate.save();
                const info = await transporter.sendMail(resetEmail(candidate.email, token));
                console.log(info.response);
                return res.redirect('/auth/login');
            } else{
                req.flash('error', 'Такого пользователя нет');
                return res.redirect('/auth/reset');
            }
        })
    } catch (error) {
        console.log(error)
    }
});

router.get('/password/:token', async (req, res) => {
    if(!req.params.token){
        return res.redirect('/auth/login');
    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token, 
            resetTokenExp: {$gt: Date.now()}
        });

        if(!user){
            req.flash('loginError', 'Ошибка восстановления пароля');
            return res.redirect('/auth/login');
        } else{
            res.render('auth/reset-password', {
                title: 'Восстановление пароля',
                isLogin: true,
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token
            });
        }
    } catch (error) {
        console.log(error);
    }
});

router.post('/password', async (req, res) => {
    const candidateToken = req.body.token;
    const newPassword = req.body.password;
    const candidateId = req.body.userId;

    try{
        const resetCandidate = await User.findOne({
            _id: candidateId,
            resetToken: candidateToken,
            resetTokenExp: {$gt: Date.now()}
        });

        if(resetCandidate){
            resetCandidate.resetToken = undefined;
            resetCandidate.resetTokenExp = undefined;
            resetCandidate.password = await bcrypt.hash(newPassword, 10);
            await resetCandidate.save();
            req.flash('success', 'Пароль успешно изменен');
            res.redirect('/auth/login');
        } else{
            req.flash('loginError', 'Время восстановления истекло');
            res.redirect('/auth/login');
        }
    } catch(err){
        console.log(err);
    }
});

module.exports = router;