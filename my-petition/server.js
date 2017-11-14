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
    let first = req.session.user.first;
    let last = req.session.user.last;
    res.render('petition', {
        layout: 'main',
        first,
        last
    })
})

app.get('/registration', (req, res) => {
    res.render('registration', {
        layout: 'main'
    })
})

app.get('/logout', (req, res) => {
    req.session =null;
    res.redirect('/')
})

app.post('/registration', (req, res) => {
    let first = req.body.first;
    let last = req.body.last;
    let password = req.body.password;
    let email = req.body.email;

    pw.hashPassword(password).then(hashedPw => {
        database.registerUser(first, last, email, hashedPw).then(id => {
            req.session.user = {
                first,
                last,
                email,
                id
            }
            res.redirect('/profile');
        }).catch(err => {
            console.log(err);
        });
    }).catch(err => {
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
    database.loginUser(email, password).then(userInfo => {
            pw.checkPassword(password, userInfo.hashed_password).then(doesMatch => {
                if(doesMatch) {
                    var first = userInfo.first;
                    var last = userInfo.last;
                    var id = userInfo.id;

                    req.session.user = {
                        first,
                        last,
                        email,
                        id
                    }
                    console.log('just set teh session', req.session);
                    res.render('thank-you', {
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
    let id = req.session.user.id;

    console.log('About to create the profile','city:',city,'age:',age,url,id);

    if(city || age || url ) {
        database.addingInfo( id, city, age, url).then(() => {
            res.redirect('/petition')
        });
    } else {
        res.redirect('/petition')
    }
})

app.post('/signPetition', (req, res) => {

    let signature = req.body.img;
    console.log('signature', signature);
    database.signPetition(signature, req.session.user.id)
    .then(signatureId => {
        req.session.user.signatureId = signatureId;
        console.log('after running signed petition', req.session);
        res.redirect('/thank-you')

    })
})

app.get('/all', (req, res) => {
    database.getSigners().then(signers => {
        res.render('signed', {
            layout: 'main',
            signers: signers
        })
    })
})

app.get('/thank-you', (req, res) => {

    database.getSignature().then(sigsIds => {
        console.log('=========sigsIds', sigsIds);
        
        res.render('thank-you', {
            layout: 'main',
            first: req.session.user.first,
            last: req.session.user.last,
            signature: req.session.user.signature
        })
    })
})


app.get('/signers/:city', (req, res) => {
    console.log('======================');
})

//=================== setting up server ========================================//

app.listen(port, () => console.log('Listening on server'));
