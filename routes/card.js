const {Router} = require('express');
const Course = require('../models/course');
const User = require('../models/user');
const router = Router();
const auth = require('../middleware/auth');


function mapCartItems(cart){
    return cart.items.map(el => {
        el.courseId.toClient();
        return {
            ...el.courseId._doc,
            id: el.courseId.id,
            count: el.count
        };
    });
}

function computePrice(courses){
    return courses.reduce((price, el) => {
        return price + el.price * el.count;
    }, 0)
}


router.post('/add', auth, async (req, res) => {
    const course = await Course.findById(req.body.id);
    await req.user.addToCart(course);
    res.redirect('/card');
});

router.get('/', auth, async (req, res)=> {
    const user = await req.user
        .populate('cart.items.courseId')
        .execPopulate();
    
    const courses = mapCartItems(user.cart);
    const price = computePrice(courses);

    res.render('card',{
        title: 'Корзина',
        isCard: true,
        courses,
        price
    });
});

router.delete('/remove/:id', auth, async (req, res) => {
    await req.user.removeFromCart(req.params.id);
    const user = await req.user
            .populate('cart.items.courseId')
            .execPopulate();
    
    const courses = mapCartItems(user.cart);
    const cart = {
        courses,
        price: computePrice(courses)
    };
    res.status(200).json(cart);
});

module.exports = router;