'use strict';
require('dotenv').config();

/**
* @ TODO make all switch statements use fuzzy
*/
var http       = require('https')
  , fuzzy      = require('fuzzy')
  , AlexaSkill = require('./AlexaSkill')
  , APP_ID     = process.env.APP_ID;

//Define base cards
var base_cards = require('./cards');

// Define fuzzy_search_options for HabitTasks and intent-slots
var fuzzy_search_options = {
  pre: '<'
  , post: '>'
  , extract: function(el) { return el.text; }
}


/**
* This function is the entrypoint for StartGame Intent.
* - Prepare the deck of 52 cards
* - Set the session
* - Let the user know game is on!
*/
var handleStartGameRequest = function(intent, session, response){
  console.log('Inside handleStartGameRequest');
  var deck = base_cards.concat(base_cards).concat(base_cards).concat(base_cards);
  console.log(deck.length);
}


//Boilerplate code....
var CircleOfDeath = function(){
  AlexaSkill.call(this, APP_ID);
};

//Boilerplate code....
CircleOfDeath.prototype = Object.create(AlexaSkill.prototype);
CircleOfDeath.prototype.constructor = CircleOfDeath;

//Boilerplate code....
CircleOfDeath.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session){
  // What happens when the session starts? Optional
  console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId
      + ", sessionId: " + session.sessionId);
};

//Boilerplate code....
CircleOfDeath.prototype.eventHandlers.onLaunch = function(launchRequest, session, response){
  // This is when they launch the skill but don't specify what they want.
  var output = 'Welcome to the Circle Of Death drinking game! ' +
    'Once the game is started, players take turns saying "draw a card"';

  var reprompt = 'Do you want to draw a card?';

  response.ask(output, reprompt);

  console.log("onLaunch requestId: " + launchRequest.requestId
      + ", sessionId: " + session.sessionId);
};

//Boilerplate code....
//This code section defines what to do when intents are found.
CircleOfDeath.prototype.intentHandlers = {
  StartGame: function(intent, session, response){
    handleStartGameRequest(intent, session, response);
  },
  HelpIntent: function(intent, session, response){
    var speechOutput = 'Once the game is started, players take turns saying "draw a card".';
    response.ask(speechOutput);
  }
};

//Boilerplate code....
exports.handler = function(event, context) {
    var skill = new CircleOfDeath();
    skill.execute(event, context);
};
