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
var circle_of_death_cards = require('./lib/circle_of_death');
var games = require('./lib/games');
var never_have_i_ever_sayings = require('./lib/never_have_i_ever');

// Define fuzzy_search_options for HabitTasks and intent-slots
var fuzzy_game_search_options = {
  pre: '<'
  , post: '>'
  , extract: function(el) { return el.game; }
}

//*****************************************************************
// Begin global function section - @todo abstract to it's own file
//*****************************************************************

global.startCircleOfDeath = function (session){
  var deck = circle_of_death_cards.concat(circle_of_death_cards).concat(circle_of_death_cards).concat(circle_of_death_cards);
  session.attributes.deck = deck;
  session.attributes.game = 'Circle Of Death';
  return session;
}

global.startNeverHaveIEver = function(session){
  session.attributes.game = 'Never Have I Ever';
  session.attributes.sayings = never_have_i_ever_sayings;
}


//*****************************************************************
// Begin utlity function section - @todo abstract to it's own file
//*****************************************************************

var drawCard = function(session){
  console.log('inside drawCard');
  var picked_card = Math.floor(Math.random()*session.attributes.deck.length);
  var card = session.attributes.deck[picked_card];
  session.attributes.current_card = card;
  session.attributes.deck.splice(picked_card, 1);
  return session;
}

var isCircleOfDeathExplosion = function(session){
  console.log('inside isCircleOfDeathExplosion');
  var num = Math.random();
  return (num < 1/session.attributes.deck.length * 3);
}


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
  var response_text = "Either no game selected or request was not understood. ";
  var header = 'No Game Specified';

  if(typeof intent.slots.game.value !== 'undefined'){
    var results = fuzzy.filter(intent.slots.game.value, games, fuzzy_game_search_options);
    if(results.length > 0 && results[0].score >= 12){
      header = results[0].original.game
      response_text = "You chose " + results[0].original.game + ". " + results[0].original.about_text;
      response_text += ". " + results[0].original.start_instructions;
      var fn = results[0].original.init_function;
      // function exists
      if (fn in global && typeof global[fn] === "function") {
        global[fn](session);
      } else{
        console.log('custom init function not found');
      }
    }
  } 
  // console.log(session);
  response.askWithCard(response_text, header, response_text);
};

/**
* This function is the entrypoint for DrawCard Intent. 
* - checks to make sure there is a deck
* - draws a card from the deck
* - prompts user if they want another card
*/
var handleDrawCardRequest = function(intent, session, response){
  console.log('Inside handleDrawCardRequest');
  var response_text = 'No deck currently set.  Tell drinkmaster to start and you will be prompted for a game.';
  var header = 'No game or deck found';
  var appended_response = "  Would you like to draw the next card?";
  switch(session.attributes.game){
    case 'Circle Of Death':
      if(typeof session.attributes.deck !== 'undefined' && session.attributes.deck.length > 0){
        session = drawCard(session);
        if(isCircleOfDeathExplosion(session)){
          response_text = "Somebody just popped to beer!  Current player must finish a new beer!  You can either tell drink master to start a new game or continue drawing cards.";
          header = 'Current player looses!'
        } else{
          response_text = session.attributes.current_card.response + appended_response;
          header = session.attributes.current_card.card_title;  
        }
        
      } else{
        response_text = 'No deck found.  Looks like your game might be over.  Please ask DrinkMaster to start.';
        header = 'No deck found.';
      }
      break;
    default:
      response_text = 'No game currently set.  Please ask DrinkMaster to start.';
      header = 'No game found';
  }
  

  response.shouldEndSession = false;

  response.askWithCard(response_text, header, response_text)
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

  var response_text = "<speak>Welcome to drink master.  Please tell me what game you would you like to play <break time=\"0.4s\" />" +
            game_text +
            ". </speak> ";
  var speech_output = {
      speech: response_text,
      type: AlexaSkill.speechOutputType.SSML
  };

  response.askWithCard(speech_output, "DrinkMaster: Game Selection", speech_output);
  // response.askWithCard(response_text, "DrinkMaster: Game Selection", response_text);
};

var handleAdvanceGameRequest = function(intent, session, request){
  console.log('Inside handleAdvanceGameRequest');

  switch(session.attributes.game){
    case 'Circle Of Death':
      handleDrawCardRequest(intent, session, request);
      break;
    case 'Never Have I Ever':
      handleNextSayingRequest(intent, session, request);
      break;
    default:

}

var handleNextSayingRequest = function(intent, session, request){


}

//*****************************************************************
// End Request Handlers
//*****************************************************************

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
  var game_text = games.map(function(element){
    return element.game;
  }).join(' <break time="0.4s" /> ');

  var response_text = "<speak>Welcome to drink master.  Please tell me what game you would you like to play <break time=\"0.4s\" /> " +
            game_text +
            ". </speak> ";
  var speech_output = {
      speech: response_text,
      type: AlexaSkill.speechOutputType.SSML
  };

  var reprompt = 'Which game would you like to play?';


  response.ask(speech_output, reprompt);
  // response.ask(response_text, reprompt);
  // 

  console.log("onLaunch requestId: " + launchRequest.requestId
      + ", sessionId: " + session.sessionId);
};

//Boilerplate code....
//This code section defines what to do when intents are found.
CircleOfDeath.prototype.intentHandlers = {
  //alexa start {game}
  StartGame: function(intent, session, response){
    handleStartGameRequest(intent, session, response);
  },
  DrawCard: function(intent, session, response){
    handleDrawCardRequest(intent, session, response);
  },
  AdvanceGame: function(intent, session, response){
    handleAdvanceGameRequest(intent, session, response);
  }
  StartDrinkMaster: function(intent, session, response){
    handleStartDrinkMasterRequest(intent, session, response);
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
