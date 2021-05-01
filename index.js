
const express = require("express"); 
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const homeRoutes = require('./routes/home');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/courses');
const cardRoutes = require('./routes/card');
const ordersRoutes = require('./routes/orders');
const Handlebars = require('handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const User = require('./models/user');


const app = express();

const hbs = exphbs.create({
    defaultLayout: "main",
    extname: "hbs",
    handlebars: allowInsecurePrototypeAccess(Handlebars)
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', './views');

app.use(async (req, resp, next) => {
    try{
        const user = await User.findById('608d5a4fd0e5081d74ffc033');
        req.user = user;
        next();
    } catch(err){
        console.log(err);
    }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({
    extended: true
}));
app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/card', cardRoutes);
app.use('/orders', ordersRoutes);

const PORT = process.env.PORT ?? 5000;


!async function(){
    try{
        const url = "mongodb+srv://egor:bZbUVx437yaPrbMO@cluster0.tp9vi.mongodb.net/shop";
        await mongoose.connect(url, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useFindAndModify: false
        });

        const candidate = await User.findOne();
        if(!candidate){
            const user = new User({
                email: "pavlovskiy@mail.ru",
                name: "Egor",
                cart: {items: []}
            });
            await user.save();
        }
        app.listen(PORT, () => {
            console.log('Server is running on port ' + PORT);
        });
    } catch(err){
        console.log(err);
    }
}();