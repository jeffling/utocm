// Events Routing

var Event = require('../models/event.js');
var User = require('../models/user.js');

// POST event/new
exports.add = function(req, res) {
    var e = new Event();
    e.name = req.body.event.name;
    e.description = req.body.event.description;
    e.start = req.body.event.start;
    e.end = req.body.event.end;
    e.cabin = (req.body.event.cabin == 'on');

    e.save( function(err) {
        if (err)
            res.send(err);
        else
            res.send(e);
    });
};

// GET event/new
exports.add_form = function(req, res) {
    var e = new Event();
    res.render('event/add', {title: 'Add new event', event: e, messages: req.flash()    });
};

// TODO: GET event/edit

// GET event/list
//
// Gets the last 10 events
// TODO: smarter query
exports.list = function(req, res){
    Event.find().limit(10).sort('-start').exec(function(err, events) {
        if (events)
            res.render('event/list', {
                title: 'List of Upcoming Events',
                events: events,
                messages: req.flash()
            });
        if (err)
            res.send(err);
    });
};
