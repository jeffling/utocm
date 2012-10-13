
/*
 * GET home page.
 */

var Event = require('../models/event');

exports.index = function(req, res){
    console.log('index function');
    Event.find().limit(10).sort(start).exec(function(err, events) {
        console.log('index function');
        if (events)
            res.render('index', events);
        if (err)
            res.send(err);
    });    //res.render('index', { title: 'Trip List' });
}
