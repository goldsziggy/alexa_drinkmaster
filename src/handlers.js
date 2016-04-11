/* 
* @Author: Matthew Zygowicz
* @Date:   2016-03-30 07:05:27
* @Last Modified by:   Matthew Zygowicz
* @Last Modified time: 2016-04-11 06:03:39
*/
/* jshint node: true */
'use strict';

require('dotenv').config();

//bring in my global functions
require('./globals');

var fuzzy      = require('fuzzy');
var AlexaSkill = require('./AlexaSkill');
var Util       = require('./util');

//Define base cards
var circle_of_death_cards = require('../lib/circle_of_death');
var games = require('../lib/games');
var never_have_i_ever_sayings = require('../lib/never_have_i_ever');
var most_likely_sayings = require('../lib/most_likely');

// Define fuzzy_search_options for HabitTasks and intent-slots
var fuzzy_game_search_options = {
  pre: '<',
  post: '>',
  extract: function(el) { return el.game; }
};




//*****************************************************************
//  Begin the Request Handling section 
//*****************************************************************
/**
* This function is the entrypoint for StartGame Intent.
* - Checks to make sure user specified a game
* - Set response text based on game selection
* - Call the global callback init_function
* - Send response
*/
var handleStartGameRequest = function(intent, session, response){
  console.log('Inside handleStartGameRequest');
  var response_text = "Either no game selected or request was not understood.";
  var header = 'No Game Specified';
  var reprompt = "Please have Alexa tell Drink Master to start to play a game.";


  if(intent.slots.game && intent.slots.game.value ){
    var results = fuzzy.filter(intent.slots.game.value, games, fuzzy_game_search_options);
    if(results.length > 0 && results[0].score >= 12){
      Util.prepareSession(session);
      header = results[0].original.game;
      response_text = "You chose " + results[0].original.game + ". " + results[0].original.about_text;
      response_text += ". " + results[0].original.start_instructions;
      reprompt = "Please say 'next' or 'advance' to start the game.";
      var fn = results[0].original.init_function;

      // Here we check if the function is set in the global namespace.
      if (fn in global && typeof global[fn] === "function") {
        global[fn](session);
      } else{
        console.log('custom init function not found');
      }
    }
  } else if(intent.slots.start.value !== 'undefined'){
    handleStartDrinkMasterRequest(intent, session, response);
    return ;
  }
  // console.log(session);
  session.attributes.last_response = response_text;
  session.attributes.last_header = header;
  response.askWithCard(response_text, reprompt, header, response_text);
};

/**
* This function is the entrypoint for drawCard Intent. 
* - checks to make sure there is a deck
* - draws a card from the deck
* - prompts user if they want another card
*/
var handleDrawCardRequest = function(intent, session, response){
  console.log('Inside handleDrawCardRequest');
  var response_text = '';
  var header = '';
  var appended_response = "  Would you like to draw the next card?";
  var reprompt = '';
  switch(session.attributes.game){
    case 'Circle Of Death':
      if(typeof session.attributes.deck !== 'undefined' && session.attributes.deck.length > 0){
        Util.drawCard(session);
        if(Util.isCircleOfDeathExplosion(session)){
          response_text = "Somebody just popped to beer!  Current player must finish a new beer!  You can either tell drink master to start a new game or continue drawing cards.";
          header = 'Current player looses!';
          reprompt = 'To continue playing, say draw card.  Otherwise tell Drink Master to start a new game.';
        } else{
          response_text = session.attributes.current_card.response + appended_response;
          reprompt = "The Last Card was: " + response_text;
          header = session.attributes.current_card.card_title;  
        }
        
      } else{
        response_text = 'No deck found.  Looks like your game might be over.  Please ask Drink Master to start.';
        reprompt = response_text;
        header = 'No deck found.';
      }
      break;
    default:
      response_text = 'No game currently set.  Please ask Drink Master to start.';
      reprompt = response_text;
      header = 'No game found';
  }
  

  response.shouldEndSession = false;
  session.attributes.last_response = response_text;
  session.attributes.last_header = header;
  response.askWithCard(response_text, header, response_text);
};

/**
* This function is the entry point for StartDrinkMaster Intent
* - gets all the games from the catalog of games
* - prepares response text
* - prompts user
*/
var handleStartDrinkMasterRequest = function(intent, session, response){
  console.log('Inside handleStartDrinkMasterRequest');

  var game_text = games.map(function(element){
    return element.game;
  }).join(' <break time="0.4s" /> ');

  var response_text = "<speak>Welcome to drink master.  Please tell me what game you would like to play <break time=\"0.4s\" />" +
            game_text +
            ". </speak> ";
  var speech_output = {
      speech: response_text,
      type: AlexaSkill.speechOutputType.SSML
  };
  var header = "DrinkMaster: Game Selection";

  Util.prepareSession(session);

  session.attributes.last_response = speech_output;
  session.attributes.last_header = header;
  // response.tell(speech_output, speech_output);
  // response.askWithCard(response_text, "DrinkMaster: Game Selection", response_text);
  response.askWithCard(speech_output, speech_output, header, speech_output);
};

var handleAdvanceGameRequest = function(intent, session, response){
  console.log('Inside handleAdvanceGameRequest');
  var response_text = '';
  var header = '';
  // if(session.attributes.game){

  // }
  switch(session.attributes.game){
    case 'Circle Of Death':
      handleDrawCardRequest(intent, session, response);
      break;
    case 'Never Have I Ever':
      handleNextSayingRequest(intent, session, response);
      break;
    case 'Most Likely':
      handleNextSayingRequest(intent, session, response);
      break;
    default:
      response_text = 'Invalid request.  Please ask Drink Master to start or restart';
      header = 'Drink Master Error';
      session.attributes.last_response = response_text;
      session.attributes.last_header = header;
      response.askWithCard(response_text, response_text, header, response_text);
  }
};

var handleRepeatRequest = function(intent, session, response){
  console.log('Inside handleAdvanceGameRequest');
  var response_text = '';
  var header = '';

  if(session.attributes.last_response && session.attributes.last_header){
    header = session.attributes.last_header;
    response_text = "The last action was: " + session.attributes.last_response;
  } else{
    response_text = 'Invalid request.  Please ask Drink Master to start or restart';
    header = 'Drink Master Error';
  }
  response.askWithCard(response_text, response_text, header, response_text);
};

var handleNextSayingRequest = function(intent, session, response){
  console.log('Inside handleNextSayingRequest');
  var response_text = '';
  var header = '';
  var reprompt = '';
  switch(session.attributes.game){
    case 'Never Have I Ever':
      Util.pickSaying(session);
      response_text = session.attributes.current_saying + '. Please say next for the next Never Have I Ever.';
      reprompt = 'The last Never Have I Ever was: ' + response_text;
      header = 'Never Have I Ever...';
      break;
    case 'Most Likely':
      Util.pickSaying(session);
      response_text = session.attributes.current_saying + '. Please say next for the next Most Likely.';
      header = 'Most Likely...';
      reprompt = 'The last Most Likely was: ' + response_text;
      break;
    default:
      response_text = 'Invalid request.  Please ask Drink Master to start or restart';
      reprompt = response_text;
      header = 'Drink Master Error';
  }

  session.attributes.last_response = response_text;
  session.attributes.last_header = header;
  response.askWithCard(response_text, reprompt, header, response_text);

};

var handleStopGameRequest = function(intent, session, response){
  console.log("Inside handleStopGameRequest");
  var response_text = "Thank you for playing Drink Master.  I hope you had a most excellent time!";
  var header = 'Goodbye and Party On!';
  response.tellWithCard(response_text, header, response_text);
};



module.exports = {
    handleStopGameRequest: handleStopGameRequest,
    handleNextSayingRequest: handleNextSayingRequest,
    handleRepeatRequest: handleRepeatRequest,
    handleAdvanceGameRequest: handleAdvanceGameRequest,
    handleStartDrinkMasterRequest: handleStartDrinkMasterRequest,
    handleDrawCardRequest: handleDrawCardRequest,
    handleStartGameRequest: handleStartGameRequest
};
