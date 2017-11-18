//THIS is a SERVER-SIDE PROJECT


const   express = require('express');
const   app = express();
const   bodyParser = require('body-parser');
const   cookieParser = require('cookie-parser');
const   cookieSession = require("cookie-session");
const   hb = require('express-handlebars');
const   router = require('./routers/router');


// ========= make webpage secure ==============================
app.disable('x-powered-by');

// ========= make sure your side cannot being put into a frame =====
app.use((req, res, next) => {
    res.setHeader('x-frame-options', 'deny');
    next();
});

//====tell express to use handlebars as its view engine ===========
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

// ====== serve static directory ==================================
app.use('/public', express.static("public"));

// ====== use cookie, cookie-session and bodyParser ================
// we need this because "cookie" is true in csrfProtection
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieSession({
    secret: 'my secret is a secret that secretly secrets itself',
    maxAge: 1000 * 60 * 60 * 24 * 14
}));



// ============== connect to our router file =================
app.use(router);

//=================== setting up server ========================================//
// listening on port 8080 unless there is no other environment. if not 8080, then listen to environment.
// useful when deploying application.
// if env. is falsy, listen to 8080.
app.listen(process.env.PORT || 8080, () => console.log('Listening on server'));
