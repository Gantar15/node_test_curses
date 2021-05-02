const {Router} = require('express');
const router = Router();
const Order = require('../models/order');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try{
        const orders = await Order.find({
            'user.userId': req.user._id
        }).populate('user.userId');

        res.render('orders', {
            isOrder: true,
            title: 'Заказы',
            orders: orders.map(order => {
                order._doc.id = order._doc._id;
                delete order._doc._id;

                return {
                    ...order._doc,
                    price: order.courses.reduce((sum, el) => 
                        sum + el.course.price * el.count, 0)
                }
            })
        });
    } catch(err) {
        console.log(err);
    }
});

router.post('/', auth, async (req, res) => {
    try{
        const user = await req.user
            .populate('cart.items.courseId')
            .execPopulate();

        const courses = user.cart.items.map(el => ({
            count: el.count,
            course: {...el.courseId._doc}
        }));

        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user
            },
            courses
        });

        await order.save();
        await req.user.clearCart();

        res.redirect('/orders');
    } catch(err){
        console.log(err);
    }
});

module.exports = router;