//THIS is a SERVER-SIDE PROJECT
//================ global variables ============================================//
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require("cookie-session");
const hb = require('express-handlebars');
const port = 8080;

// =====require file that server-side javascript==================
const database = require('./database.js');


//====tell express to use handlebars as its view engine ===========
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');


// ====== serve static directory ==================================
app.use('/public', express.static("public"));


// ====== use cookie, cookie-session and bodyParser ================
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieSession({
    secret: 'my secret is a secret that secretly secrets itself',
    maxAge: 1000 * 60 * 60 * 24 * 14
}));

// ======== getting the functions that (1) hash the password and (2) compares it to existing passwords in the database

const pw = require('./passwords.js');


//=============== routes =======================================================d//

app.get('/', (req, res) => {
    res.redirect('/registration')
})

app.get('/petition', (req, res) => {

    // let first = req.session.user.first;
    // let last = req.session.user.last;
    res.render('petition', {
        layout: 'main',
        // first,
        // last
    })
})

app.get('/registration', (req, res) => {
    res.render('registration', {
        layout: 'main'
    })
})

app.post('/registration', (req, res) => {
    let first = req.body.first;
    let last = req.body.last;
    let password = req.body.password;
    let email = req.body.email;

    pw.hashPassword(password).then((hashedPw) => {
        database.registerUser(first, last, email, hashedPw).then((userId) => {
            req.session.user = {
                first,
                last,
                email,
                id: userId
            }
            res.redirect('/profile');
        }).catch((err) => {
            console.log(err);
        });
    }).catch((err) => {
        console.log(err);
    })
})

app.get('/login', (req, res) => {
    res.render('login', {
        layout: 'main'
    })
})

app.post('/login', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    // var id = req.session.user; //++++++++++++++why dont i have access to is with req.session.id??

    database.loginUser(email, password).then(results => {
        //get id of user and join the tables
        var first = results.first;
        var last = results.last;
        var id = results.id;

            pw.checkPassword(password, results.hashed_password).then(result => {
                console.log('what is the value of result after checkPassword', result);
                if(result == true) {
                    res.render('petition', {
                        layout: 'main',
                        first,
                        last
                    })
                } else {
                    res.redirect('login')
                }
            }).catch(err => {
                console.log(err);
            })

    }).catch(err => {
        console.log(err);
    })
})

app.get('/profile', (req, res) => {
    res.render('profile', {
        layout: 'main',
    })
})

app.post('/profile', (req, res) => {
    let city = req.body.city;
    let age = req.body.age;
    let url = req.body.url;
    let id = req.session.user.id[0].id;
    if(city || age || url ) {
        database.addingInfo(id, city, age, url).then(() => {
            res.redirect('/petition')
        });
    } else {
        res.redirect('/petition')
    }
})

app.post('/thanks', (req, res) => {
    let first = req.body.first;
    let last = req.body.last;
    let signature = req.body.img;
    database.signPetition(first, last, signature)
    res.render('thank-you', {
        layout: 'main',
        first: first,
        last: last,
        signature: signature
    })
})

app.get('/all', (req, res) => {
    database.getSigners().then(signers => {
        console.log('!!!!!!!!!!!all signers come here',signers);
        res.render('signed', {
            layout: 'main',
            signers: signers
        })
    })
})

app.get('/signers/:city', (req, res) => {
    console.log('======================');
})

//=================== setting up server ========================================//

app.listen(port, () => console.log('Listening on server'));
