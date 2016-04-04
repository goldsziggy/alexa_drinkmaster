/* 
* @Author: Matthew Zygowicz
* @Date:   2016-03-28 13:12:07
* @Last Modified by:   Matthew Zygowicz
* @Last Modified time: 2016-03-30 06:17:02
*/
/* jshint node: true */
'use strict';

//*****************************************************************
// Begin utlity function section 
//*****************************************************************

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