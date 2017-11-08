var spicedPg = require('spiced-pg');
const secret = require('./secret.json')

var db = spicedPg(`postgres:${secret.username}:${secret.password}@localhost:5432/myPetition`);



exports.signPetition = function(first, last, signature) {
  db.query(`INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3)`,
  [first, last, signature]
  ).then((results) => {
      console.log(results);
  }).catch((err) => {
      console.log(err);
  });
};


//
//
// function findCity(name) {
//
//   db.query(
//
//   "SELECT * FROM cities WHERE city = $1 AND id = $2",
//     [name, id].then(function(result) {
//       console.log(result.rows)
//     }).catch(function(err) {
//       console.log(err);
//     })
//
// }
