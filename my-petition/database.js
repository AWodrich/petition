const spicedPg = require('spiced-pg');
const secret = require('./secret.json');
const pw = require('./passwords.js');
var db = spicedPg(`postgres:${secret.username}:${secret.password}@localhost:5432/myPetition`);


exports.signPetition = (first, last, signature) => {
  return db.query(`INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3)`,
  [first, last, signature]
  ).then((results) => {
    //   console.log('THIS IS THE SIGNATURE', signature);
    //   console.log('RESULTS WHEN SIGNED', results);
  }).catch((err) => {
      console.log(err);
  });
};

exports.registerUser = (first, last, email, hashedPassword) => {
  return db.query(`INSERT INTO users (first, last, email, hashed_password) VALUES ($1, $2, $3, $4) RETURNING id`,
  [first, last, email, hashedPassword]
  ).then(results => {
    //   console.log('3=====results from registered user', results.rows);
      return results.rows
  }).catch(err => {
      console.log(err);
  });
};


exports.loginUser = (email, password, id) => {
    const q = `SELECT email, hashed_password, id, first, last FROM users WHERE users.email = '${email}'`;
    return db.query(q).then(result => {
        // console.log('id', id);
        console.log(result.rows[0])
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

exports.register = () => {
    return db.query(
        `INSERT first,last, hashedPw FROM users`
    ).then(result => {
        return result.rows;
    }).catch(err => {
        console.log(err);
    });
}
