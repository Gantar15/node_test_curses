
const {body} = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

module.exports.registerValidators = [
    body('email').isEmail().withMessage('Некорректный email')
        .custom(async (value, {req}) => {
            try{
                const user = await User.findOne({email: value});
                if(user){
                    return Promise.reject('Данный email уже занят');
                }
            } catch(err){
                console.log(err);
            }
        })
        .normalizeEmail(),

    body('password', 'Пароль должен быть длиной 6-45 символов')
        .isLength({min: 6, max: 45})
        .isAlphanumeric()
        .trim(),

    body('confirm')
        .custom((value, {req}) => {
            if(value !== req.body.password){
                throw new Error('Пароли должны совпадать');
            }
            else{
                return true;
            }
        })
        .trim(),

    body('name').isLength({min: 3})
        .withMessage('Имя должно состоять минимум из 3 символов')
        .trim(),
];

module.exports.loginValidators = [
    body('email')
        .custom(async (value, {req}) => {
            try{
                const user = await User.findOne({email: value});                
                if(!user){
                    return Promise.reject('Такого пользователя не существует');
                }
            } catch(err){
                console.log(err);
            }
        }),
    body('password')
        .custom(async (value, {req}) => {
            try{
                const user = await User.findOne({email: req.body.email}); 
                if(user){
                    const areSame = await bcrypt.compare(value, user.password);
                    
                    if(!areSame){
                        return Promise.reject('Неверный пароль');
                    }
                }
            } catch(err){
                console.log(err);
            }
        })
];


module.exports.courseValidators = [
    body('title', 'Минимальная длина названия 3 символа').isLength({min: 3}).trim(),
    body('price').isNumeric().withMessage('Некорректная цена'),
    body('img').isURL().withMessage('Некорректный адрес изображения')
];