/* 
* @Author: Matthew Zygowicz
* @Date:   2016-03-28 13:12:07
* @Last Modified by:   Matthew Zygowicz
* @Last Modified time: 2016-03-30 06:17:02
*/
/* jshint node: true */
'use strict';
require('dotenv').config();
var mysql      = require('mysql');

//*****************************************************************
// Begin utlity function section 
//*****************************************************************
exports.loadState = function(intentRequest, session, response, callback){
  console.log('Inside loadState()');
  var connection = mysql.createConnection({
    host     : process.env.AMZN_RDS_HOST,
    user     : process.env.AMZN_RDS_USER,
    password : process.env.AMZN_RDS_PASS,
    database : process.env.AMZN_RDS_DB
  });
  connection.connect();
  connection.query("SELECT userId, state, timestamp FROM drinkmaster_state WHERE userId=? ORDER BY timestamp DESC LIMIT 1",[session.user.userId], function(err, rows, fields){
    if(err){
      console.log('error! ' + err);
      //restart game
      callback(intentRequest, session, response);
    } else {
      if(rows[0].timestamp){
        var lastUpdate = new Date(rows[0].timestamp)
        var current_time = new Date();
        var diffInMs = current_time - lastUpdate;
        var diffMins = Math.round(((diffInMs % 86400000) % 3600000) / 60000); //differnce in minutes
        console.log('diffMins: ' + diffMins);
        if(diffMins <= 10)
          callback(intentRequest, JSON.parse(rows[0].state), response)
        else
          callback(intentRequest, session, response)
      } else{
        callback(intentRequest, session, response);
      }

    }
  });
  connection.end(); 
}

// exports.saveState = function(intentRequest, session, response, callback){
exports.saveState = function(session, cb){
  console.log('Inside saveState()');
  var json = JSON.stringify(session);

  var connection = mysql.createConnection({
    host     : process.env.AMZN_RDS_HOST,
    user     : process.env.AMZN_RDS_USER,
    password : process.env.AMZN_RDS_PASS,
    database : process.env.AMZN_RDS_DB
  });
  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
   
    console.log('connected as id ' + connection.threadId);
  });
  connection.query("INSERT INTO drinkmaster_state (userId, state) VALUES (?,?)",[session.user.userId, json], function(err, result) {
    cb();
    // callback(intentRequest, session, response);
  });
  connection.end();  
  
}


/**
* This function will prepare/clear the session.
* this is called after each start game request.
* Due to Javascripts pass by reference philospohy, you don't need to return session.
*/
exports.prepareSession = function(session){
  console.log('inside clearSession');
  session.attributes.sayings = [];
  session.attributes.current_saying = '';
  session.attributes.deck = [];
  session.attributes.current_card = {};
  session.attributes.last_response = '';
};

/**
 * This function draws a card from the deck inside thte session.
 * The drawn card is set to 'current_card' within the session and removed from the deck.
 * @param  session
 */
exports.drawCard = function(session){
  console.log('inside drawCard');
  var picked_card = Math.floor(Math.random()*session.attributes.deck.length);
  var card = session.attributes.deck[picked_card];
  session.attributes.current_card = card;
  session.attributes.deck.splice(picked_card, 1);
};

/**
 * This function selects a saying from the list of sayings inside the session.
 * The selected saying is set to 'current_saying' within the session and removed from the list of sayings
 * @param  session
 */
exports.pickSaying = function(session){
  console.log('inside pickSaying');
  var picked_saying = Math.floor(Math.random()*session.attributes.sayings.length);
  var saying = session.attributes.sayings[picked_saying];
  session.attributes.current_saying = saying;
  session.attributes.sayings.splice(picked_saying, 1);
};

/**
 * This function detects if the can has popped in circle of death.
 * @param  session - must have session.attributes set
 * @return Boolean
 */
exports.isCircleOfDeathExplosion = function(session){
  console.log('inside isCircleOfDeathExplosion');
  var num = Math.random();
  return (num < 1/session.attributes.deck.length * 3);
};