
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , flash = require('connect-flash');

var app = express();

app.configure(function(){

  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('alfalfa'));
  app.use(express.session({ cookie: { maxAge: 60000 }}));
  app.use(flash());
  app.use(passport.initialize());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

// Local middleware/configs. 
// TODO: move all configs in here
app.locals = require('./locals.js');

app.configure('development', function(){
  var db = mongoose.connect('localhost', 'utoctm');
  app.use(express.errorHandler());
});

// passport configuration
var User = require('./models/user.js');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    User.findOne({ email: email }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Unknown user' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Invalid password' });
      }
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne(id, function (err, user) {
    done(err, user);
  });
});


// routes
var index = require('./routes')
  , events = require('./routes/events')
  , users = require('./routes/users');

app.get('/', users.add_form);
app.post('/event/new',  events.add);
app.get('/event/new', events.add_form);
app.get('/event/list', events.list);
app.post('/user/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/user/login',
                                   failureFlash: true })
);
app.get('/user/login', users.login);
// app.get('/user/list', users.list);
app.post('/user/new', users.verify_add, users.add);
app.get('/user/new', users.add_form);
app.get('/verify/email', users.verify_email);
app.post('/paypal/ipn', users.ipn_handler);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
