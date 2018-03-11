const express = require('express'),
  fs = require('fs'),
  router = express.Router(),
  config = require('../config/config'),
  icons = require('../data/icons'),
  modJSON = require('../modules/modJSON'),
  listFiles = require('../modules/listFiles'),
  files = require('../data/files'),
  elements = require('../../public/data/elements'),
  passport = require('passport'),
  Strategy = require('passport-local').Strategy,
  users = require('../config/users'),
  ces = require('connect-ensure-login'),
  bcrypt = require('bcrypt-nodejs'),
  aceConf = require('../config/aceConf'),
  html2pug = require('html2pug');


//listFiles.listFiles("css");
//listFiles.listFiles("js");
//listFiles.listFiles("data");
//listFiles.templates("elements");
//listFiles.templates("includes");
//listFiles.templates("macros");
//listFiles.templatesMain("main");
/*
bcrypt.genSalt(10, function(err, salt) {

  bcrypt.hash("admin", salt, null, function(err, hash) {

      console.log("salt: " + salt)
      console.log("hash: " + hash)
      var obj = {
        "salt": salt,
        "hash:": hash
      };

      console.log(JSON.stringify(obj));

      fs.writeFile('./password.json', JSON.stringify(obj), 'utf8');

      bcrypt.compare("admin", hash, function(err, res) {
        // res == true
        console.log(res)
      });

  });



});
*/



if (config.app.login) {
  passport.use(new Strategy(
    function(username, password, cb) {
      users.findByUsername(username, function(err, user) {
        if (err) {
          return cb(err);
        }
        if (!user) {
          return cb(null, false);
        }
        bcrypt.compare(password, user.password, function(err, res) {
          if (res != true) {
            return cb(null, false);
          }
        });
        return cb(null, user);
      });
    }));

  passport.serializeUser(function(user, cb) {
    cb(null, user.id);
  });

  passport.deserializeUser(function(id, cb) {
    users.findById(id, function(err, user) {
      if (err) {
        return cb(err);
      }
      cb(null, user);
    });
  });
} else {
  // disable login
  ces.ensureLoggedIn = function(){
    return function(req, res, next) {
      req.session.returnTo = req.originalUrl || req.url;
      next();
    }
  };
}

router.get('/login',
  function(req, res) {
    res.render('login');
  });

router.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout',
  function(req, res) {
    req.logout();
    res.redirect('/');
  });



/* GET home page. */
router.get('/', ces.ensureLoggedIn(), function(req, res) {
  res.render('index', {
    title: 'dash',
    config: config,
    icons: icons
  });
});



router.get('/admin/settings', ces.ensureLoggedIn(), function(req, res) {
  res.render('settings', {
    title: 'settings',
    config: config,
    user: req.user
  });
});

router.get('/admin/editor', ces.ensureLoggedIn(), function(req, res) {
  //var css = listFiles.listFiles("./admin/public/css");
  res.render('editor', {
    title: 'editor',
    config: config,
    elements: elements,
    files: files,
    aceConf: aceConf,
    user: req.user
  });
});

router.get('/skeleton', function(req, res) {
  res.render('skeleton', {
    title: 'skeleton'
  });
});

router.get('/admin/dashboard', ces.ensureLoggedIn(), function(req, res) {
  res.render('dash', {
    title: 'dashboard',
    config: config,
    user: req.user
  });
});

router.get('/admin/upload', ces.ensureLoggedIn(), function(req, res) {
  res.render('upload', {
    title: 'upload',
    config: config,
    user: req.user
  });
});

config.elements.forEach(function(i) {

  router.get('/elements/' + i, function(req, res) {
    res.render('elements/' + i, {
      config: config,
      icons: icons
    });
  });

});

router.post('/preview', ces.ensureLoggedIn(), function(req, res) {
  var toPreview = req.body.toPreview;
  //res.send('OK');
  console.log(toPreview);
  //res.send(toPreview);
  res.render('preview', {
    title: 'preview',
    out: toPreview
  });
});

module.exports = router;
