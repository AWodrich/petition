//THIS is a SERVER-SIDE PROJECT
//================ global variables ============================================//
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require("cookie-session");
const hb = require('express-handlebars');
var csrf = require('csurf');






// ========= make webpage secure ==============================
app.disable('x-powered-by');

// ========= make sure your side cannot being put into a frame =====
app.use((req, res, next) => {
    res.setHeader('x-frame-options', 'deny');
    next();
});


// =====require file that server-side javascript==================
const database = require('./database.js');


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

var csrfProtection = csrf({ cookie: true })


// ======== getting the functions that (1) hash the password and (2) compares it to existing passwords in the database

const pw = require('./passwords.js');


//=============== routes =======================================================d//

app.get('/', (req, res) => {
    res.redirect('/registration')
})

app.get('/petition',csrfProtection, (req, res) => {
    let first = req.session.user.first;
    let last = req.session.user.last;
    // pass the csrfToken to the view
    res.render('petition', {
        layout: 'main',
        first,
        last,
        csrfToken: req.csrfToken()
    })
})

app.get('/registration', csrfProtection, (req, res) => {
    res.render('registration', {
        layout: 'main',
        csrfToken: req.csrfToken()
    })
})

app.post('/logout', (req, res) => {
    req.session = null;
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

app.get('/login', csrfProtection, (req, res) => {
    res.render('login', {
        layout: 'main',
        csrfToken: req.csrfToken()
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
                    var city = userInfo.city;
                    var age = userInfo.age

                    req.session.user = {
                        first,
                        last,
                        email,
                        id,
                        age,
                        city
                    }

                    database.getSignature(id).then(sigsIds => {
                        res.render('thank-you', {
                            layout: 'main',
                            first: req.session.user.first,
                            last: req.session.user.last,
                            signature: sigsIds[0].signature
                        })
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

app.get('/profile', csrfProtection, (req, res) => {
    res.render('profile', {
        layout: 'main',
        csrfToken: req.csrfToken()
    })
})

app.post('/profile', (req, res) => {
    let city = req.body.city;
    let age = req.body.age;
    let url = req.body.url;
    let id = req.session.user.id;

    if(city || age || url ) {
        database.addingInfo( id, city, age, url).then(() => {
            req.session.user.city = city;
            req.session.user.age = age;
            req.session.user.url = url;
            res.redirect('/petition')
        });
    } else {
        res.redirect('/petition')
    }
})

app.post('/signPetition', (req, res) => {
    let signature = req.body.img;
    database.signPetition(signature, req.session.user.id)
    .then(signatureId => {
        req.session.user.signatureId = signatureId;
        res.redirect('/thank-you')

    })
})

app.get('/all', csrfProtection, (req, res) => {
    database.getSigners().then(signers => {
        res.render('signed', {
            layout: 'main',
            signers: signers,
            csrfToken: req.csrfToken()
        })
    })
})

app.get('/thank-you', csrfProtection, (req, res) => {
    // console.log('is this the id????', req.session.user.id);
    let id = req.session.user.id;
    database.getSignature(id).then(sigsIds => {
        res.render('thank-you', {
            layout: 'main',
            first: req.session.user.first,
            last: req.session.user.last,
            signature: sigsIds[0].signature,
            csrfToken: req.csrfToken()
        })
    })
})


app.get('/signers/:city', csrfProtection, (req, res) => {
    var city = req.params.city;
    database.getSignersCities(city).then(signersCity => {
        res.render('signers-cities', {
            layout: 'main',
            signersCity,
            city:signersCity[0].city,
            csrfToken: req.csrfToken()
        })

    }).catch(err => {
        console.log(err);
    })
})

app.get('/update', csrfProtection, (req, res) => {
    var first = req.session.user.first;
    var last = req.session.user.last;
    var email = req.session.user.email;
    if(req.session.user.age || req.session.user.url || req.session.user.city) {
        res.render('edit', {
            layout: 'main',
            first,
            last,
            email,
            age: req.session.user.age,
            city: req.session.user.city,
            url: req.session.user.url,
            csrfToken: req.csrfToken()
        })
    } else {
        res.render('edit', {
            layout: 'main',
            first,
            last,
            email,
            csrfToken: req.csrfToken()
        })
    }
})

app.post('/update', (req, res) => {
    var newFirst = req.body.first;
    var newLast = req.body.last;
    var newAge = req.body.age;
    var newEmail = req.body.email;
    var newPassword = req.body.password;
    var newCity = req.body.city;
    var newUrl = req.body.url;

    if(newAge || newCity || newUrl){
        if(!req.session.user.age || !req.session.user.city || !req.session.user.url) {
            database.insertIntoUserProfiles(newCity, newAge, newUrl)
            .then(newData => {
                req.session.user.age = newData.age;
                req.session.user.city = newData.city;
                req.session.user.url = newData.url;
                console.log('see updated session object', req.session.user);
            })
            .catch(err => {
                console.log(err);
            })
        }
    } else {
        console.log('no new input');
    }

    //check if age, city and url has input. if not, do insert into database
    //if input do update of database. remeber to join tables!!
    //password: do not show passowrd in field.
    //but if password is being changed, hash it!!
    console.log('post updating');
})

app.post('/delete', (req, res) => {
    //delete the signature inside database.
    //do db.query
    res.redirect('/petition')
})

//=================== setting up server ========================================//
// listening on port 8080 unless there is no other environment. if not 8080, then listen to environment.
// useful when deploying application.
// if env. is falsy, listen to 8080.
app.listen(process.env.PORT || 8080, () => console.log('Listening on server'));
