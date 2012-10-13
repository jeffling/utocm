var path = "/calendar/v3/calendars/calendarId/events";

var EventEmitter = require('events').EventEmitter,
        https = require('https'),
        http = require('http'),
        querystring = require('querystring'),
        url = require('url');

var postData = {
    accountType: "GOOGLE",
    Email: "jeff.ummu@gmail.com", //replace this with your google email address 
    Passwd: "tiredd68703fyvw", //replace this with your password
    service: "cl",
    source: 'GCLNodejs' + "_" + '0.2.2'
};

var auths = {};
var content = querystring.stringify(postData);

var loginRequest = {
  host: "www.google.com",
  path: '/accounts/ClientLogin',
  port: 443,
  method: "POST",
  headers: {
    'Content-Length': content.length,
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};

var data = "";

var request = https.request(loginRequest, function(res)
{
  res.on("data", function(chunk) { 
    data = data + chunk; 
  });
  res.on("end", function() {
    data.split('\n').forEach(function (dataStr) {
        var datas = dataStr.split('=');
        auths[datas[0]] = datas[1];
    }); 
    sendQuery();
  });
});

request.write(content);
console.log(content);
request.end();


function sendQuery() {
    var event = {
    "data": {
        "title": "Tennis with Beth",
        "details": "Meet for a quick lesson.",
        "transparency": "opaque",
        "status": "confirmed",
        "location": "Rolling Lawn Courts",
        "attendees": [
        {
            "email": "utoclub@gmail.com"
        }],
        "start": [
        {
            "dateTime": "2012-08-27T15:00:00.000Z"
        }],
        "end": [
        {
            "dateTime": "2012-08-27T17:00:00.000Z"
        }]
    }
    };

    var calRequest = {
      host: "www.googleapis.com",
      path: path,
      port: 443,
      method: "POST",
      headers: {
        'Authorization': 'GoogleLogin auth=' + auths.Auth,
        'Content-Type': 'application/json'
      }
    };  
    
    var request = https.request(calRequest, function(response) {
    
        var buffer = "";

        // redirection handling
        if (response.statusCode == 302) {
            path = url.parse(response.headers.location).pathname + "?" + url.parse(response.headers.location).query;
            sendQuery();
            console.log('wat');
        } 
        else {    
            response.on("data", function(data) { 
                buffer = buffer + data;
            });
            
            response.on("end", function() { 
                done(buffer); 
            });
        
            response.on("close", function() { 
                done(buffer);
            });
        }
    });
    
    function done(buffer) {
        console.log(JSON.parse(buffer));
    }

    request.write(JSON.stringify(event));
    request.end();
    
    request.on('error', function(e) {
    console.error("error");
    });
    
}