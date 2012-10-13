var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , SHA2 = new (require('jshashes').SHA512)()
  , saltString = "yousalty?"

function encodePassword( pass ){
    if( typeof pass === 'string' && pass.length < 6 )
        return '';
    return SHA2.b64_hmac(pass, saltString);
}


// Set the membership to expire in 8 months by default. 
// In reality this function isn't useful - Expired date will be set once 
// payment is confirmed. I guess it could be used as a helper function. We will see.
// TODO: Calculate the end of the school term?
function expiredDate() {
    x = new Date();
    x.setMonth(x.getMonth() + 8);
    return x;
}

var userSchema = new Schema({
    name: String,
    email: {
        type: String,
        require: true,
        index: { unique: true }
    },
    password: {
        type: String,
        set: encodePassword },
    student_number: Number,
    phone: Number,
    joined:{
        type: Date,
        default: Date.now },
    expires: Date,
    paid: {
        status: {
            type: Boolean,
            default: false 
        },
        expires: {
            type: Date,
            default: expiredDate
        }
    },
    membership_type: String,
    email_verified: {
        type: Boolean,
        default: false
    },
    vtoken: {
        type: String,
        index: {unique:true}
    }
});

// checks if password is valid, returns boolean
userSchema.methods.validPassword = function(password) {
    if (encodePassword(password) == this.password)
        return true;
    else
        return false;
};

userSchema.methods.generateToken = function() {
    var already_exists = false;
    var token;
    do  {
        token = Math.random().toString(36).substring(2);
        this.model('User').findOne({vtoken: token}, function(err, user) {
            if (user)
                already_exists = true;
        });
    } while (already_exists === true);
    return token;
};
module.exports = mongoose.model('User', userSchema);
