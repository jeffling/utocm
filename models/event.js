var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

function validatePresenceOf(value) {
    return value && value.length;
}

var eventSchema = new Schema({
    name: {type: String, required: true},
    owner: {type: ObjectId},
    description: String,
    start: {type: Date, required: true},
    end: Date,
    cabin: {type: Boolean, default: false}
});

module.exports = mongoose.model('Event', eventSchema);
