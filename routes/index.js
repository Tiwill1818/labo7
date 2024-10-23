/**
 * @file index.js
 * @author William Robert
 * @version 1.00
 * @date 2024/10/23
 * @brief Routeur pour la page d'accueil
 */




var express = require('express');
var router = express.Router();
var session = require('cookie-session');

var mysql = require('mysql');

var connection = mysql.createConnection({
  host: '172.17.15.180',
  user: 'root',
  password: 'wrobert',
  database: 'labo7'
});

connection.connect(function (err) {
  if (err) throw err;
  console.log('Vous êtes connecté à votre BDD...');
});






/* GET home page. */
router.use(session({ secret: 'todotopsecret' }))
  .use(function (req, res, next) {
    console.log("USE");
    if (typeof (req.session.user) == 'undefined') {
      req.session.user = resetCookie();
    }
    next();
  });
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express', connectedUser: req.session.user });
});

router.get('/login', function (req, res, next) {
  let messageError = req.session.user.messageError;
  req.session.user.messageError = "";
  res.render('login', { title: 'Login', messageError: messageError, connectedUser: req.session.user });

});

router.post('/login', function (req, res, next) {
  var querystring = 'SELECT * FROM tsession WHERE login = "' + req.body.username + '" AND password = "' + req.body.password + '";';
  var query = connection.query(querystring, function (err, rows, fields) {
    if (!err) {
      if (rows.length) {
        req.session.user = updateCookie(rows);
        res.redirect('/account');
      } else {
        req.session.user.messageError = "Erreur d'authentification";
        res.redirect('/login');
      }
    }
  });
});

router.get('/logout', function (req, res, next) {
  req.session.user = resetCookie();
  res.render('index', { title: 'Express', connectedUser: req.session.user });
});

router.get('/account', function (req, res, next) {
  console.log("GET /account");
  var querystring = 'SELECT * FROM tsession WHERE id = "' + req.session.user.id + '";';
  var query = connection.query(querystring, function (err, rows, fields) {
    if (!err) {
      if (rows.length)
        req.session.user = updateCookie(rows);

      if (req.session.user.nivDroit == 3) {
        var querystring2 = 'SELECT * FROM tsession;';
        var query2 = connection.query(querystring2, function (err, rows, fields) {
          if (!err) {
            res.render('userPage', { title: 'Admin', connectedUser: req.session.user, users: rows });
          }
        });
      }
      else
        res.render('userPage', { title: 'Account', connectedUser: req.session.user });
    }
  });
});
router.post('/account', function (req, res, next) {
  var querystring = 'UPDATE tsession SET ' + Object.keys(req.body)[0] + ' = "' + Object.values(req.body)[0] + '" WHERE id = ' + req.session.user.id + ';';
  var query = connection.query(querystring, function (err, rows, fields) {
    if (!err) {
      req.session.user[Object.keys(req.body)[0]] = Object.values(req.body)[0];
      res.redirect('/account');
    }
  });
});


function updateCookie(rows) {
  let data = {
    connected: true,
    messageError: "",
    username: rows[0].login,
    password: rows[0].password,
    id: rows[0].id,
    nivDroit: rows[0].nivDroit,
    texteAccueil: rows[0].texteAccueil
  };
  return data;
}

function resetCookie() {
  let data = {
    connected: false,
    messageError: "",
    username: "",
    password: "",
    id: 0,
    nivDroit: 0,
    texteAccueil: ""
  };
  return data;
}


module.exports = router;
