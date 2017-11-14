const spicedPg = require('spiced-pg');
const secret = require('./secret.json');
const pw = require('./passwords.js');
var db = spicedPg(`postgres:${secret.username}:${secret.password}@localhost:5432/myPetition`);


exports.signPetition = (signature, userId) => {
    var q = `INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id`;
    var params = [signature, userId];

  return db.query(q, params)
  .then((results) => {
      console.log('results from the query thing', results.rows);
      return results.rows[0].id
  }).catch((err) => {
      console.log(err);
  });
};

exports.registerUser = (first, last, email, hashedPassword) => {
    var q = `INSERT INTO users (first, last, email, hashed_password)
            VALUES ($1, $2, $3, $4)
            RETURNING id`;
    var params = [first, last, email, hashedPassword];
    return db.query(q, params)
    .then(results => {
        return results.rows[0].id
    }).catch(err => {
        console.log(err);
    });
};


exports.loginUser = (email, password) => {
    var q = `SELECT email, hashed_password, users.id, users.first, signatures.id AS sigId, users.last
            FROM users
            LEFT JOIN signatures
            ON users.id = signatures.user_id
            WHERE users.email = $1`;
    return db.query(q,[email]).then(result => {
        console.log('inside database loginUser', result.rows);
        return result.rows[0];
    }).catch(err => {
        console.log(err);
    });
}

exports.addingInfo = (id, city, age, url) => {
    var q = `SELECT users.id AS id, user_profiles.id AS id
            FROM users
            JOIN user_profiles
            ON users.id = user_profiles.user_id`;
    return db.query(q)
    .then(results => {
        var q = `INSERT INTO user_profiles (user_id, city, age, url) VALUES ($1, $2, $3, $4)`;
        var params = [id, city, age, url];
        return db.query(q,params)
        .then(results => {
            return results
        }).catch(err => {
            console.log(err);
        })
    }).catch(err => {
        console.log(err);
    })
}

exports.getSigners = () => {
    return db.query(
        `SELECT first,last FROM signatures`
    ).then(result => {
        return result.rows;
    }).catch(err => {
        console.log(err);
    });
}

exports.getSignature = () => {
    var q = `SELECT signatures.signature AS userSig, signatures.user_id AS id, users.id AS id
            FROM signatures
            JOIN users
            ON signatures.user_id = users.id`
    return db.query(q)
    .then(userInfosOnSig => {
        return userInfosOnSig.rows
        console.log('++++++++getting user info and sig id on thankyou page', userInfosOnSig.rows);
    }).catch(err => {
        console.log(err);
    })
}

exports.register = () => {
    return db.query(
        `INSERT first,last, hashedPw FROM users`
    ).then(result => {
        return result.rows;
    }).catch(err => {
        console.log(err);
    });
}
