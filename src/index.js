const express = require('express');
const morgan = require('morgan');
const path = require('path');
const indexRoute = require('./routes/index');


const csrf = require("csurf");
const cookies = require("cookie-parser");

const csrfMiddleware = csrf({cookie:true});
const app = express();
// Settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile)

// static files
app.use(express.static(path.join(__dirname, 'public')))

// middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cookies());
app.use(csrfMiddleware);


app.all("*", (req, res, next) => {
    var token = req.csrfToken();
    res.cookie("XSRF-TOKEN", token);
    res.locals.csrfToken = token;
    console.log("Token: ",token)
    next();
});
//routes
app.use(indexRoute);


//static files

// escuchando el servidor
app.listen(app.get('port'), ()=>{
    console.log('Server on port', app.get('port'));
})
