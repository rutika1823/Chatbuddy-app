const moment = require('moment')

//get here message from server.js
function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format('h:mm a'),
  }
}

module.exports = formatMessage