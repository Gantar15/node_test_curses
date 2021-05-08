
const express = require("express"); 
const session = require('express-session');
const csrf = require('csurf');
const flash = require('connect-flash');
const MongoStore = require('connect-mongodb-session')(session);
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const homeRoutes = require('./routes/home');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/courses');
const cardRoutes = require('./routes/card');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const Handlebars = require('handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const keys = require('./keys/index');


const app = express();
const hbs = exphbs.create({
    defaultLayout: "main",
    extname: "hbs",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: require('./utils/hbs-helpers')
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', './views');

const store = new MongoStore({
    collection: 'sessions',
    uri: keys.mongoURI
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({
    extended: true
}));
app.use(session({
    secret: keys.session_secret,
    resave: false,
    saveUninitialized: false,
    store
}));
app.use(csrf());
app.use(flash());
app.use(varMiddleware);
app.use(userMiddleware);

app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/card', cardRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);

const PORT = process.env.PORT ?? 5000;


!async function(){
    try{
        await mongoose.connect(keys.mongoURI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useFindAndModify: false
        });

        app.listen(PORT, () => {
            console.log('Server is running on port ' + PORT);
        });
    } catch(err){
        console.log(err);
    }
}();