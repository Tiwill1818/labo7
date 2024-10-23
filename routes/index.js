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

var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : '172.17.15.180',
  user     : 'root',
  password : 'wrobert',
  database : 'labo7'
});

connection.connect(function (err) {
  if (err) throw err;
  console.log('Vous êtes connecté à votre BDD...');
});






/* GET home page. */
router.use(session({ secret: 'todotopsecret' }))
  .use(function (req, res, next) {
  if (typeof(req.session.user) == 'undefined') {
    req.session.user = {
      connected: false,
      username: "",
      password: "",
      id: 0,
      nivDroit: 0,
      texteAccueil: ""
    }
  }
  next();
})
.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', connectedUser: req.session.user });
  console.table(req.session.user);
});

router.get('/login', function (req, res, next) {
  res.render('login', { title: 'Login', connectedUser: req.session.user, messageError: "" });
});

router.post('/', function (req, res, next) {
  console.table(req.body);
  
  var querystring = 'SELECT * FROM tsession WHERE login = "'+req.body.username+'" AND password = "'+req.body.password+'";';
  var query = connection.query(querystring, function(err, rows, fields) {
    if (!err) {
      console.log("Ma requête est passée !");
      console.table(rows);
      if (rows.length) {

        req.session.user.connected = true;
        req.session.user.username = rows[0].login;
        req.session.user.password = rows[0].password;
        req.session.user.id = rows[0].id;
        req.session.user.nivDroit = rows[0].nivDroit;
        req.session.user.texteAccueil = rows[0].texteAccueil;
        if (req.session.user.nivDroit == 3)
        {
          var querystring2 = 'SELECT * FROM tsession;';
          var query2 = connection.query(querystring2, function(err, rows, fields) {
              if (!err) {
                  console.log("Ma requête est passée !");
                  console.table(rows);
                  res.render('userPage', { title: 'Admin', connectedUser: req.session.user, users: rows });
              }
          });
        }
        else
          res.render('userPage', { title: 'Account', connectedUser: req.session.user });
        }
      else {
        res.render('login', { title: 'Login', messageError: "Erreur d'authentification", connectedUser: req.session.user });
      }
    }
  }); 
});

router.get('/logout', function (req, res, next) {
  req.session.user.connected = false;
  req.session.user.username = "";
  req.session.user.password = "";
  req.session.user.id = 0;
  req.session.user.nivDroit = 0;
  req.session.user.texteAccueil = "";

  res.render('index', { title: 'Express', connectedUser: req.session.user });
  console.table(req.session.user);
});

router.get('/account', function (req, res, next) {
  if (req.session.user.nivDroit == 3)
  {
    var querystring2 = 'SELECT * FROM tsession;';
    var query2 = connection.query(querystring2, function(err, rows, fields) {
        if (!err) {
            console.log("Ma requête est passée !");
            console.table(rows);
            res.render('userPage', { title: 'Admin', connectedUser: req.session.user, users: rows });
        }
    });
  }
  else
    res.render('userPage', { title: 'Account', connectedUser: req.session.user });
  console.table(req.session.user);
})
  .post('/account', function (req, res, next) {
    
    var querystring = 'UPDATE tsession SET '+Object.keys(req.body)[0]+' = "' + Object.values(req.body)[0] + '" WHERE id = ' + req.session.user.id + ';';
    var query = connection.query(querystring, function (err, rows, fields) {
      if (!err) {
        console.log("Ma requête est passée !");
        console.table(rows);
        
        req.session.user[Object.keys(req.body)[0]] = Object.values(req.body)[0];
        console.table(req.session.user);
      }
      
      if (req.session.user.nivDroit == 3)
      {
        var querystring2 = 'SELECT * FROM tsession;';
        var query2 = connection.query(querystring2, function(err, rows, fields) {
            if (!err) {
                console.log("Ma requête est passée !");
                console.table(rows);
                res.render('userPage', { title: 'Admin', connectedUser: req.session.user, users: rows });
            }
        });
      }
      else
        res.render('userPage', { title: 'Account', connectedUser: req.session.user });
    });
  });

module.exports = router;
