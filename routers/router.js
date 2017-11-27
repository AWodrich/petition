var   express = require('express'),
      router = express.Router(),
      csrf = require('csurf'),
      csrfProtection = csrf();
const pw = require('../passwords');
const database = require('../database');


      //=============== routes =======================================================d//

//    1. Main page
router.get('/', (req, res) => {
    res.redirect('/registration')
})

//   2. Registration page

router.route('/registration')

    .get(csrfProtection, (req, res) => {
          console.log('BEFORE REGISTRATION +++ session object here', req.session.user);
          res.render('registration', {
              layout: 'main',
              csrfToken: req.csrfToken()
          })
    })

    .post((req, res) => {
          console.log('AFTER REGISTRATION +++ session object here', req.session.user);
          let first = req.body.first;
          let last = req.body.last;
          let password = req.body.password;
          let email = req.body.email;
          if(!first || !last || !password || !email) {
              let error = "Please register to continue"
              res.render('error', {
                  layout: 'main',
                  error
              })
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
    });


//  3. Profile Page

router.route('/profile')

    .get(csrfProtection, (req, res) => {
          console.log('GET PROFILE ++++ session object here', req.session.user);

          res.render('profile', {
              layout: 'main',
              csrfToken: req.csrfToken()
          })
    })

    .post((req, res) => {
          console.log('POST PROFILE ++++ session object here', req.session.user);

          let city = req.body.city.toLowerCase();
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
    });


//  4. Petition Page

router.route('/petition')

    .get(csrfProtection, (req, res) => {
          console.log('BEFORE PETITION ++++ session object here', req.session.user);
          let first = req.session.user.first;
          let last = req.session.user.last;
          res.render('petition', {
              layout: 'main',
              first,
              last,
              csrfToken: req.csrfToken()
          })
    })

    .post((req, res) => {
          console.log('AFTER SIGNING PETITION +++ session object here', req.session.user);
          let signature = req.body.img;
          database.signPetition(signature, req.session.user.id)
          .then(signatureId => {
              req.session.user.signatureId = signatureId;
              res.redirect('/thank-you')
          })
    });


//  5.Thank-you Page

router.get('/thank-you', csrfProtection, (req, res) => {
      console.log('THANKYOU +++ session object here', req.session.user);
      let id = req.session.user.id;
      database.getSignature(id).then(sigsIds => {
          console.log('\\\\\\\sigs Id here at thank you',sigsIds);
          database.getAllSigners().then(results => {
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
});


//  6. All Signers

router.route('/signers')

    .get(csrfProtection, (req, res) => {
          console.log('DISPLAY ALL +++ session object here', req.session.user);
          database.getSigners().then(signers => {
              res.render('signed', {
                  layout: 'main',
                  signers: signers,
                  csrfToken: req.csrfToken()
              })
          })
    });

// 7. Signers by City

    router.get('/signers/:city', csrfProtection, (req, res) => {
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
    });


//  8. Update

router.route('/update')

    .get(csrfProtection, (req, res) => {
          console.log('GET UPDATE session object here', req.session.user);
          var session = req.session.user;
          console.log('here the user_profiles data', session.city );
        //   database.getQuotes().then(results => {
              res.render('edit', {
                  layout: 'main',
                  first: session.first,
                  last: session.last,
                  email: session.email,
                  age: session.age,
                  city: session.city,
                  url: session.url,
                  csrfToken: req.csrfToken()
              })
        //   }).catch(err => {
            //   console.log(err);
        //   })
    })

    .post((req, res) => {
          var newFirst = req.body.first;
          var newLast = req.body.last;
          var newAge = req.body.age;
          var newEmail = req.body.email;
          var newPassword = req.body.password;
          var newCity = req.body.city;
          var newUrl = req.body.url;
          console.log('POST UPDATE === session object here', req.session.user);

          if(newPassword.length > 0) {
              console.log('length of password', newPassword.length);
              database.updateUsers(newFirst, newLast, newEmail, req.session.user.id)
              .then(result => {
                  req.session.user.first = result.first;
                  req.session.user.last = result.last;
                  req.session.user.email = result.email;

                  console.log('==============password??', newPassword);

                  pw.hashPassword(newPassword)
                  .then(hash => {
                      return database.updateHashedPassword(hash, req.session.user.id)
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
          } else {
              var user = req.body;
              database.updateUsers(user.first, user.last, user.email, req.session.user.id)
              .then(result => {
                  req.session.user.first = result.first;
                  req.session.user.last = result.last;
                  req.session.user.email = result.email;
              }).catch(err => {
                  console.log(err);
              })
          }

          if(req.session.user.age || req.session.user.city || req.session.user.url) {
              var valueToUpdate = req.body;
              database.updateProfile(req.session.user.id, valueToUpdate.city, valueToUpdate.age, valueToUpdate.url)
              .then(results => {
                  req.session.user.age = results.age;
                  req.session.user.city = results.city;
                  req.session.user.url = results.url;
                  res.redirect('/thank-you')
              })
              .catch(err => {
                  console.log(err);
              })
          } else {
              let city = req.body.city.toLowerCase();
              let age = req.body.age;
              let url = req.body.url;
              let id = req.session.user.id;
              database.addingInfo( id, city, age, url).then(() => {
                  req.session.user.city = city;
                  req.session.user.age = age;
                  req.session.user.url = url;
                  res.redirect('/thank-you')
              });
          }
    });


//  9. Login

router.route('/login')

    .get(csrfProtection, (req, res) => {
          console.log('BEFORE LOGIN ++++ session object here', req.session.user);
          res.render('login', {
              layout: 'main',
              csrfToken: req.csrfToken()
          })
    })

    .post((req, res) => {
          var email = req.body.email;
          var password = req.body.password;
          database.loginUser(email, password).then(userInfo => {
                console.log('userInfo', userInfo);
                pw.checkPassword(password, userInfo.hashed_password).then(doesMatch => {
                    //   console.log('session???', req.session);
                    console.log('doesMatch', doesMatch);
                      if(doesMatch) {
                         console.log('userinfo in if statement',userInfo)
                          req.session.user = {
                              signature:userInfo.sigid,
                              age:userInfo.age,
                              city:userInfo.city,
                              first:userInfo.first,
                              last:userInfo.last,
                              id:userInfo.id,
                              email: userInfo.email
                          }
                          console.log('++++++session after login', req.session.user);
                          console.log('sig', req.session.user.signature);
                          if(req.session.user.signature) {
                                database.getSignature(req.session.user.id).then(sigsIds => {
                                  res.redirect('/thank-you')
                              })
                          } else {
                              res.redirect('/petition')
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
    });


//  10. Logout

router.post('/logout', (req, res) => {
    console.log('AFTER LOGOUT ++++ session object here', req.session.user);
    req.session = null;
    res.redirect('/')
});


//  11. Delete

router.post('/delete', (req, res) => {
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


// ====== Export module router ===========//

module.exports = router;
