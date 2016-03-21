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
var most_likely_sayings = require('./lib/most_likely');

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
  var start_index = Math.floor(Math.random()*never_have_i_ever_sayings.length);
  var arr = []
  if(start_index > never_have_i_ever_sayings.length - 100 )
    start_index = start_index - 100;
  for(var i=0;i < 100; i++){
    arr.push(never_have_i_ever_sayings[start_index + i]);
  }
  session.attributes.sayings = arr;
  return session;
}

global.startMostLikely = function(session){
  session.attributes.game = 'Most Likely';
  session.attributes.sayings = most_likely_sayings;
  return session;
}


//*****************************************************************
// Begin utlity function section - @todo abstract to it's own file
//*****************************************************************

/**
* This function will prepare/clear the session.
* this is called after each start game request
*/
var prepareSession = function(session){
  console.log('inside clearSession');
  session.attributes.sayings = [];
  session.attributes.current_saying = '';
  session.attributes.deck = [];
  session.attributes.current_card = {};
  session.attributes.last_response = '';
  return session;
}

var drawCard = function(session){
  console.log('inside drawCard');
  var picked_card = Math.floor(Math.random()*session.attributes.deck.length);
  var card = session.attributes.deck[picked_card];
  session.attributes.current_card = card;
  session.attributes.deck.splice(picked_card, 1);
  return session;
}

var pickSaying = function(session){
  console.log('inside pickSaying');
  var picked_saying = Math.floor(Math.random()*session.attributes.sayings.length);
  var saying = session.attributes.sayings[picked_saying];
  session.attributes.current_saying = saying;
  session.attributes.sayings.splice(picked_saying, 1);
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
      session = prepareSession(session);
      header = results[0].original.game;
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
  } else if(intent.slots.start.value !== 'undefined'){
    handleStartDrinkMasterRequest(intent, session, response);
    return ;
  }
  // console.log(session);
  session.attributes.last_response = response_text;
  session.attributes.last_header = header;
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
  var response_text = '';
  var header = '';
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
        response_text = 'No deck found.  Looks like your game might be over.  Please ask Drink Master to start.';
        header = 'No deck found.';
      }
      break;
    default:
      response_text = 'No game currently set.  Please ask Drink Master to start.';
      header = 'No game found';
  }
  

  response.shouldEndSession = false;
  session.attributes.last_response = response_text;
  session.attributes.last_header = header;
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

  var response_text = "<speak>Welcome to drink master.  Please tell me what game you would like to play <break time=\"0.4s\" />" +
            game_text +
            ". </speak> ";
  var speech_output = {
      speech: response_text,
      type: AlexaSkill.speechOutputType.SSML
  };
  var header = "DrinkMaster: Game Selection";

  session = prepareSession(session);

  session.attributes.last_response = speech_output;
  session.attributes.last_header = header;
  // response.tell(speech_output, speech_output);
  // response.askWithCard(response_text, "DrinkMaster: Game Selection", response_text);
  response.askWithCard(speech_output, header, speech_output);
};

var handleAdvanceGameRequest = function(intent, session, response){
  console.log('Inside handleAdvanceGameRequest');
  var response_text = '';
  var header = '';

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
      response.askWithCard(response_text, header, response_text);
  }
}

var handleRepeatRequest = function(intent, session, response){
  console.log('Inside handleAdvanceGameRequest');
  var response_text = '';
  var header = '';

  if(session.attributes.last_response && session.attributes.last_header){
    header = session.attributes.last_header;
    response_text = session.attributes.last_response;
  } else{
    response_text = 'Invalid request.  Please ask Drink Master to start or restart';
    header = 'Drink Master Error';
  }
  // switch(session.attributes.game){
  //   case 'Circle Of Death':
  //     response_text = session.attributes.current_card.response + ". Would you like to draw the next card?";
  //     header = session.attributes.current_card.card_title;
  //     break;
  //   case 'Never Have I Ever':
  //     response_text = session.attributes.current_saying + '. Please say next for the next Never Have I Ever.';
  //     header = "Never Have I Ever";
  //     break;
  //   case 'Most Likely':
  //     response_text = session.attributes.current_saying + '. Please say next for the next Most Likely.';
  //     header = "Most Likely";
  //     break;
  //   default:
      
  // }
  response.askWithCard(response_text, header, response_text);
}

var handleNextSayingRequest = function(intent, session, response){
  console.log('Inside handleNextSayingRequest');
  var response_text = '';
  var header = '';

  switch(session.attributes.game){
    case 'Never Have I Ever':
      session = pickSaying(session);
      response_text = session.attributes.current_saying + '. Please say next for the next Never Have I Ever.';
      header = 'Never Have I Ever...';
      break;
    case 'Most Likely':
      session = pickSaying(session);
      response_text = session.attributes.current_saying + '. Please say next for the next Most Likely.';
      header = 'Most Likely...';
      break;
    default:
      response_text = 'Invalid request.  Please ask Drink Master to start or restart';
      header = 'Drink Master Error';
  }

  session.attributes.last_response = response_text;
  session.attributes.last_header = header;
  response.askWithCard(response_text, header, response_text);

};

var handleStopGameRequest = function(intent, session, response){
  console.log("Inside handleStopGameRequest");
  var response_text = "Thank you for playing Drink Master.  I hope you had a most excellent time!";
  var header = 'Goodbye and Party On!';
  response.tellWithCard(response_text, header, response_text);
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
  var header = "DrinkMaster: Game Selection";
  var game_text = games.map(function(element){
    return element.game;
  }).join(' <break time="0.4s" /> ');

  var response_text = "<speak>Welcome to drink master.  Please tell me what game you would like to play <break time=\"0.4s\" /> " +
            game_text +
            ". </speak> ";
  var speech_output = {
      speech: response_text,
      type: AlexaSkill.speechOutputType.SSML
  };

  var reprompt = 'Which game would you like to play?';

  session = prepareSession(session);
  session.attributes.last_response = speech_output;
  session.attributes.last_header = header;
  // response.ask(speech_output, reprompt);
  response.askWithCard(speech_output, header, speech_output);
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
  Repeat: function(intent, session, response){
    handleRepeatRequest(intent, session, response);
  },
  DrawCard: function(intent, session, response){
    handleDrawCardRequest(intent, session, response);
  },
  AdvanceGame: function(intent, session, response){
    handleAdvanceGameRequest(intent, session, response);
  },
  StartDrinkMaster: function(intent, session, response){
    handleStartDrinkMasterRequest(intent, session, response);
  },
  StopGame: function(intent,session, response){
    handleStopGameRequest(intent, session, response);
  },
  HelpIntent: function(intent, session, response){
    var speechOutput = 'Drink Master is a series of interactive drinking games.  Saying "Drink Master Start" will begin the game selection process.';
    response.ask(speechOutput);
  }
};

//Boilerplate code....
exports.handler = function(event, context) {
    var skill = new CircleOfDeath();
    skill.execute(event, context);
};
