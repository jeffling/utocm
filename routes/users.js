
var Event = require('../models/event.js');
var User = require('../models/user.js');
var nodemailer = require('nodemailer');
var config = require('../config.js');

// GET /user/new
exports.add_form = function(req, res) {
  var u = new User();
  res.render('user/add', {title: 'Sign up', user: u, messages: req.flash()});
};

// POST /user/new
exports.verify_add = function(req, res, next) {
  var u = new User();
  u.email = req.body.user.email;
  u.name = req.body.user.name;
  u.student_number = req.body.user.student_number.replace(/ /g,'');
  u.phone = req.body.user.phone.replace(/ /g,'');
  var error = false;

  var atpos=u.email.indexOf("@");
  var dotpos=u.email.lastIndexOf(".");
  if (atpos<1 || dotpos<atpos+2 || dotpos+2>=x.length) {
    req.flash('error', 'Not a valid e-mail address');
    error = true;
  }

  if (isNaN(u.student_number)) {
    req.flash('error', 'Invalid student number.');
    error = true;
  }
  if (isNaN(u.phone)) {
    req.flash('error', 'Invalid phone number (at least put in numbers!)');
    error = true;
  }

  // if (req.body.user.password.length < 6) {
  //   req.flash('error', 'Your password must be at least 6 characters long.');
  //   error = true;
  // }

  // if (req.body.user.password != req.body.user.password2) {
  //   req.flash('error', 'Mismatching passwords');
  //   error = true;
  // }

  User.findOne({ email: u.email }, function (err, user) {
    if (user) {
      req.flash('error', 'This email has already been used to register an account.');
      res.render('user/add', {
        title: 'Sign up - Error',
        user: u,
        messages: req.flash()
      });
    }
  });

  if (error) {
      res.render('user/add', {
      title: 'Sign up - Error',
      user: u,
      messages: req.flash()
    });
  }
  else {
    next();
  }
};

// setup paypal payment button
function paypalButton(user) {
  var notify_url = config.url + "/paypal/verify";
  var success_url = config.url + "/paypal/success";
  var fail_url = config.url + "/paypal/fail";
  var item_name;
  var price;
  if (membership_type == 'student'){
    price = 20 * 0.059;
    item_name = 'UTOC Membership';
  }
  else if (membership_type == 'other'){
    price = 30 + 0.059;
    item_name = 'UTOC Other Membership';
  }
  else if (membership_type == 'family'){
    price = 40 + 0.059;
    item_name = 'UTOC Family Membership';
  }

  var html = '<FORM action="https://www.paypal.com/cgi-bin/webscr" method="post">' +
      '<input type="hidden" name="business" value="utoclub@gmail.com">' +

     '<INPUT TYPE="hidden" name="cmd" value=" _xclick">' +
     '<INPUT TYPE="hidden" name="custom" value="' + user.vtoken + '">' +
     '<INPUT TYPE="hidden" name="return" value="' + success_url + '">' +
     '<INPUT TYPE="hidden" name="cancel_return" value="' + fail_url + '">' +
     '<INPUT TYPE="hidden" name="email" value="' + user.email + '">' +
     '<INPUT TYPE="hidden" name="no_shipping" value="1">' +
     '<input type="hidden" name="item_name" value="'+ item_name +'">' +
     '<input type="hidden" name="amount" value="'+ price +'">' +
     '<input type="hidden" name="currency_code" value="CAD">' +
     '<input type="image" name="submit" border="0" ' +
        'src="https://www.paypal.com/en_US/i/btn/btn_buynow_LG.gif" ' +
        'alt="PayPal - The safer, easier way to pay online">' +
      '<img alt="" border="0" width="1" height="1"' +
        'src="https://www.paypal.com/en_US/i/scr/pixel.gif" >' +
        '</form>';

  return html;
}

function emailVerification(user) {
  var auth_url = config.url + "/verify/email?email=" + user.email + "&token=" + user.vtoken;
  var smtpTransport = nodemailer.createTransport("SMTP",{
    service: config.email.service,
    auth: {
        user: config.email.user,
        pass: config.email.pass
    }
  });

  // setup e-mail data
  var mailOptions = {
      from: config.email.from, // sender address
      to: user.email, // list of receivers
      subject: "Thanks for joining " + config.short_name + "! Please verify your email.", // Subject line
      html: "<p>Hi,</p>"+
          "<p>Thanks for registering for the " + config.name + "! We&#39;re glad to have you join us.</p>" +
          "<p>Before you become a full member, you must:</p>" +
          "<p><b>1)</b> Verify your email here: <a href='http://" + auth_url + "'>"+ auth_url + "</a></p>" +
          "<p><b>2)</b> Pay the membership fees, either in person or via paypal on the site after you verify your email.</p>" +
          "<p>Thanks for joining, and we look forward to seeing you in events!</p>",
      text: "Please authorize your account to complete registration at " + auth_url + "."
  };

  console.log(mailOptions.html);
  var success = true;
  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
      console.log(error);
      success = false;
    }
    smtpTransport.close();
  });
  return success;
}

exports.add = function(req, res) {
  var u = new User();
  u.email = req.body.user.email;
  u.name = req.body.user.name;
  u.phone = req.body.user.phone.replace(/ /g,'');
  u.membership_type = req.body.user.membership_type;
  u.student_number = req.body.user.student_number;
  u.vtoken = u.generateToken();

  u.save(function(err) {
    if (err) {
      console.log(err.toString());
      req.flash('error', err.toString());
      res.render('user/add',
        { title: 'Sign up - Error',
          user: u,
          messages: req.flash()
        });
    } else {
      if (emailVerification(u))
        req.flash('info', 'Registration Successful. Verification email sent.');
      else
        req.flash('error', 'Registration Successful. Problem with verification email.');
      res.redirect('/');
    }
  });
};

// GET /user/login
exports.login = function(req, res) {
  res.render("user/login", {title: 'Login', messages: req.flash()});
};

// GET /verify/email
exports.verify_email = function(req, res) {
  User.findOne({ email: req.query['email'], email_token: req.query['token'] }, function (err, user) {
    if (user) {
      user.email_verified = true;
      user.save(function(err) {
        if (err) req.flash('error', 'Email verification error');
        else req.flash('info', 'Email verified.');
        // apparently have to put the redirect in this block or else
        // flash messages won't pass over
        res.redirect('/');
      });
    }
    else if (err) {
      req.flash('error', err.toString());
      res.redirect('/');
    }
  });
};

// POST /paypal/ipn
var ipn = require('paypal-ipn');
exports.ipn_handler = function(req, res) {
  ipn.verify(req.body, function callback (err, msg) {
    if (!err) {
      User.findOne({vtoken:req.body.custom}, function (err, user) {
        if (!err && params.payment_status == 'Completed') {
          user.paid.status = true;
          user.paid.expire = config.expire_date;
          user.save();
          console.log('Payment recieved from ' + user.email);
        }
        else {
          console.log('Incomplete payment recieved from ' + user.email);
        }
      });
    }
  });
};