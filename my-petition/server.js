//THIS is a SERVER-SIDE PROJECT
//================ global variables ============================================//
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require("cookie-session");
const hb = require('express-handlebars');
const csrf = require('csurf');






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
    console.log('BEFORE PETITION ++++ session object here', req.session.user);
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
    console.log('BEFORE REGISTRATION +++ session object here', req.session.user);

    res.render('registration', {
        layout: 'main',
        csrfToken: req.csrfToken()
    })
})

app.post('/logout', (req, res) => {
    console.log('AFTER LOGOUT ++++ session object here', req.session.user);

    req.session = null;
    res.redirect('/')
})

app.post('/registration', (req, res) => {
    console.log('AFTER REGISTRATION +++ session object here', req.session.user);
    let first = req.body.first;
    let last = req.body.last;
    let password = req.body.password;
    let email = req.body.email;
    if(!first || !last || !password || !email) {
        res.send(`<p>To continue please provide all information!</p>
                <a href="/registration"><button>Go to Registration</button></a>`)
    } else {
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
    }
})

app.get('/login', csrfProtection, (req, res) => {
    console.log('BEFORE LOGIN ++++ session object here', req.session.user);

    res.render('login', {
        layout: 'main',
        csrfToken: req.csrfToken()
    })
})

app.post('/login', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    database.loginUser(email, password).then(userInfo => {
        console.log('userInfo', userInfo);
        console.log('======after logged in', userInfo);
            pw.checkPassword(password, userInfo.hashed_password).then(doesMatch => {
                console.log('session???', userInfo);
                if(doesMatch) {
                    req.session.user = {
                        signature:userInfo.sigid,
                        age:userInfo.age,
                        city:userInfo.city.toLowerCase(),
                        first:userInfo.first,
                        last:userInfo.last,
                        id:userInfo.id
                    }

                    console.log('++++++session after login', req.session.user);
                    console.log('sig', req.session.user.signature);
                    if(req.session.user.signature) {
                        database.getSignature(req.session.user.id).then(sigsIds => {
                            res.redirect('/thank-you')
                            // res.render('thank-you', {
                            //     layout: 'main',
                            //     first: req.session.user.first,
                            //     last: req.session.user.last,
                            //     signature: sigsIds[0].signature
                            // })
                        })
                    } else {
                        res.redirect('/petition')
                        // let message = "You have not signed yet. Please sign here."

                        // res.send(`<p>You have not signed the petition. If you wish so <a href="/petition">click here</a>
                        //             <a href="/all"><button>Check out all signers</button></a>`)
                    }
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
    console.log('GET PROFILE ++++ session object here', req.session.user);

    res.render('profile', {
        layout: 'main',
        csrfToken: req.csrfToken()
    })
})

app.post('/profile', (req, res) => {
    console.log('POST PROFILE ++++ session object here', req.session.user);

    let city = req.body.city.toLowerCase();
    let age = req.body.age;
    let url = req.body.url;
    let id = req.session.user.id;

    if(city.toLowerCase() || age || url.toLowerCase() ) {
        database.addingInfo( id, city, age, url).then(() => {
            req.session.user.city = city.toLowerCase();
            req.session.user.age = age;
            req.session.user.url = url;
            res.redirect('/petition')
        });
    } else {
        res.redirect('/petition')
    }
})

app.post('/signPetition', (req, res) => {
    console.log('AFTER SIGNING PETITION +++ session object here', req.session.user);

    let signature = req.body.img;

    console.log('/////////////////////', signature);
    database.signPetition(signature, req.session.user.id)
    .then(signatureId => {
        req.session.user.signatureId = signatureId;
        res.redirect('/thank-you')
    })
})

app.get('/all', csrfProtection, (req, res) => {
    console.log('DISPLAY ALL +++ session object here', req.session.user);

    database.getSigners().then(signers => {
        res.render('signed', {
            layout: 'main',
            signers: signers,
            csrfToken: req.csrfToken()
        })
    })
})

app.get('/thank-you', csrfProtection, (req, res) => {
    console.log('THANKYOU +++ session object here', req.session.user);
    let id = req.session.user.id;
    database.getSignature(id).then(sigsIds => {
        console.log('\\\\\\\sigs Id here at thank you',sigsIds);
        database.getAllSigners().then(results => {
            console.log('results', results);
            console.log('signature?', sigsIds[0].signature)
            res.render('thank-you', {
                layout: 'main',
                numOfSigs: results,
                first: req.session.user.first,
                last: req.session.user.last,
                signature: sigsIds[0].signature,
                csrfToken: req.csrfToken()

            })
        })
        .catch(err => {
            console.log(err);
        })
    })
    .catch(err => {
        console.log(err);
    })
})


app.get('/signers/:city', csrfProtection, (req, res) => {
    console.log('SIGNERS BY CITY====session object here', req.session.user);

    var city = req.params.city;
    database.getSignersCities(city).then(signersCity => {
        res.render('signers-cities', {
            layout: 'main',
            signersCity,
            city: signersCity[0].city.toLowerCase(),
            csrfToken: req.csrfToken()
        })
    }).catch(err => {
        console.log(err);
    })
})

app.get('/update', csrfProtection, (req, res) => {
    console.log('GET UPDATE session object here', req.session.user);

    var session = req.session.user;
        res.render('edit', {
            layout: 'main',
            first: session.first,
            last: session.last,
            email: session.email,
            age: session.age,
            city: session.city.toLowerCase(),
            url: session.url,
            csrfToken: req.csrfToken()
        })
})

app.post('/update', (req, res) => {
    var newFirst = req.body.first;
    var newLast = req.body.last;
    var newAge = req.body.age;
    var newEmail = req.body.email;
    var newPassword = req.body.password;
    var newCity = req.body.city.toLowerCase();
    var newUrl = req.body.url;
    console.log('POST UPDATE === session object here', req.session.user);

    if(newPassword.length >= 0) {
        var user = req.body;
        database.updateUsers(user.first, user.last, user.email, user.password, req.session.user.id)
        .then(result => {
            req.session.user.first = result.first;
            req.session.user.last = result.last;
            req.session.user.email = result.email;

            pw.hashPassword(result.hashed_password)
            .then(result => {
                return database.updateHashedPassword(result, req.session.user.id)
                .then(result => {
                    res.redirect('/thank-you')
                })
            })
            .catch(err => {
                console.log(err);
            })
        })
        .catch(err => {
            console.log(err);
        })
    }
    if(req.session.user.age || req.session.user.city || req.session.user.url) {
        var valueToUpdate = req.body;
        database.updateProfile(req.session.user.id, valueToUpdate.city, valueToUpdate.age, valueToUpdate.url)
        .then(results => {
            req.session.user.age = results.age;
            req.session.user.city = results.city.toLowerCase();
            req.session.user.url = results.url;
            res.redirect('/thank-you')
        })
        .catch(err => {
            console.log(err);
        })
    }
})

app.post('/delete', (req, res) => {
    console.log('POST DELETE +++ session object here', req.session.user);
    console.log('id at post delete', req.session.user.id);
    database.deleteSignature(req.session.user.id)
    .then(() => {
        res.redirect('/petition')
    })
    .catch(err => {
        console.log(err);
    })
})

//=================== setting up server ========================================//
// listening on port 8080 unless there is no other environment. if not 8080, then listen to environment.
// useful when deploying application.
// if env. is falsy, listen to 8080.
app.listen(process.env.PORT || 8080, () => console.log('Listening on server'));
