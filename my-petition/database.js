const spicedPg = require('spiced-pg');
const secret = require('./secret.json');
const pw = require('./passwords.js');
var db = spicedPg(`postgres:${secret.username}:${secret.password}@localhost:5432/myPetition`);


exports.signPetition = (signature, userId) => {
    var q = `INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id`;
    var params = [signature, userId];

  return db.query(q, params)
  .then((results) => {
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
//===getting user data
exports.getSigners = () => {
    //joining table users and user_profiles
    //in order to get data first, name,age and city
    //condition: take data where user_id from table a matches with id from table b.
    return db.query(
        `SELECT users.first,users.last, user_profiles.city, user_profiles.age
        FROM users
        JOIN user_profiles
        ON user_profiles.user_id=users.id`
    ).then(result => {
        return result.rows;
    }).catch(err => {
        console.log(err);
    });
}

exports.getSignature = (id) => {
    var q = `SELECT signatures.signature, signatures.user_id, users.id
            FROM users
            JOIN signatures
            ON signatures.user_id = users.id
            WHERE users.id = $1`
    return db.query(q,[id])
    .then(userInfosOnSig => {
        return userInfosOnSig.rows
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


exports.getSignersCities = (city) => {
    var q = `SELECT user_profiles.city, users.first, users.last, user_profiles.age
            FROM users
            LEFT JOIN user_profiles
            ON user_profiles.user_id = users.id
            WHERE user_profiles.city = $1`
    return db.query(q,[city])
        .then(usersCity => {
            return usersCity.rows;
        }).catch(err => {
            console.log(err);
        })
}
