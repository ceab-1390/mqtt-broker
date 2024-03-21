require('dotenv').config()
require('./broker');
const express = require('express')
const app = express();
const routes = require('./routes/routes');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Cambia a true si estás en producción y usas HTTPS
}));



app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(expressLayouts);

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(routes)
app.use('/public', express.static(__dirname + '/public'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/img', express.static(__dirname + '/public/img'));
app.use('/js', express.static(__dirname + '/node_modules/chart.js/dist'))
app.use('/js', express.static(__dirname + '/public/js'))
app.use('/js', express.static(__dirname + '/node_modules/sweetalert2/dist'))



app.listen(process.env.HTTP_PORT,()=>{
    console.log('Charts start on port: '+process.env.HTTP_PORT)
});