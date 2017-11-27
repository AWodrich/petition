const spicedPg = require('spiced-pg');
const pw = require('./passwords.js');


if(process.env.DATABASE_URL){
    dbUrl = process.env.DATABASE_URL
} else {
    var info = require('./secret.json')
    dbUrl = `postgres:${info.username}:${info.password}@localhost:5432/myPetition`
}

var db = spicedPg(dbUrl);


exports.signPetition = (signature, userId) => {
    var q = `INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id`;
    var params = [signature, userId];

  return db.query(q, params)
  .then(results => {
      return results.rows[0].id
  })
  .catch((err) => {
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
    // console.log('loggin in password hashed?', password, 'email', email);
    var q = `SELECT users.email, users.hashed_password, users.id, users.first, signatures.id AS sigId, users.last, age, city, url
            FROM users
            LEFT JOIN signatures
            ON users.id = signatures.user_id
            LEFT JOIN user_profiles
            ON user_profiles.user_id = signatures.user_id
            WHERE users.email = $1`;
    return db.query(q,[email]).then(result => {
        return result.rows[0];
    }).catch(err => {
        console.log(err);
    });
}

exports.addingInfo = (id, city, age, url) => {
    // console.log('in here now?????');
    var q = `SELECT users.id AS userId, user_profiles.id AS profileId
            FROM users
            JOIN user_profiles
            ON users.id = user_profiles.user_id`;
    return db.query(q)
    .then(results => {
        var q = `INSERT INTO user_profiles (user_id, city, age, url)
                VALUES ($1, $2, $3, $4)`;
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
            WHERE LOWER(user_profiles.city) = LOWER($1)`
    return db.query(q,[city])
        .then(usersCity => {
            // console.log('+++++++++++++++++++++++++++++++++++++++++');
            // console.log('usersCity length', usersCity.rows.length);
            return usersCity.rows;
        }).catch(err => {
            console.log(err);
        })
}

exports.insertIntoUserProfiles = (city, age, url) => {
    var q = `INSERT INTO user_profiles(city, age, url)
            VALUES ($1, $2, $3)
            RETURNING city,age,url`
    var params = [city, age, url];
    return db.query(q, params)
    .then(insertedData => {
        return insertedData.rows[0]
    })
    .catch(err => {
        console.log(err);
    })
}

exports.updateProfile = (id, city, age, url) => {
    var q = `UPDATE user_profiles
            SET (city, age, url) = ($2, $3, $4)
            WHERE user_profiles.user_id = $1
            RETURNING id, city, age, url`;
    var params = [id, city, age, url];
    return db.query(q, params)
    .then(results =>{
        return results.rows[0];
    })
    .catch(err => {
        console.log(err);
    })
}

exports.updateUsers = (first, last, email, id) => {
    var q = `UPDATE users
            SET (first, last, email) = ($1, $2, $3)
            WHERE id = $4
            RETURNING first,last,email`;
    var params = [first, last, email, id];
    return db.query(q, params)
    .then(updatedData => {
        return updatedData.rows[0];
    })
    .catch(err => {
        console.log(err);
    })
}

exports.updateHashedPassword = (hashedPassword, id) => {
    var q = `UPDATE users
            SET hashed_password = $1
            WHERE id = $2
            RETURNING hashed_password`;
    var params = [hashedPassword, id];
    return db.query(q, params)
    .then(hashedPassword => {

    })
    .catch(err => {
        console.log(err);
    })
}

exports.getAllSigners = () => {
    var q = `SELECT users.id
            FROM users`
    return db.query(q)
    .then(database => {
        // console.log('getting the database lenght?',database.rows.length);
        return database.rows.length
    })
    .catch(err => {
        console.log(err);
    })
}

exports.deleteSignature = (id) => {
    // console.log('id here', id);
    var q = `DELETE FROM signatures
            WHERE user_id = $1`;
    var params = [id];
    return db.query(q, params)
    .then(data => {
        // console.log('after deleting', data.rows);
    })
    .catch(err => {
        console.log(err);
    })
}

// exports.getQuotes = () => {
//     var q = `SELECT FROM quotes`;
//     return db.query(q)
//     .then(quoteResults => {
//         console.log('========all quotes',quoteResults.rows)
//         return quoteResults.rows;
//     }).catch(err => {
//         console.log(err);
//     })
// }
