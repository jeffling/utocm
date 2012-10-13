
// Code for messages flashes
//

exports.flashMessages = function(reqmsg) {
  var html = '';
  ['error', 'info'].forEach(function(type) {
    var messages = reqmsg[type];
    var m;
    if (messages)
      if (messages.length > 0) {
        for (m in messages) {
          html += '<div class="' + type + ' ui-corner-all">' +
            messages[m] + '</div>';
      
        }
      }
  });
  return html;
};