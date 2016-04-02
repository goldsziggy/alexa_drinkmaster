'use strict';
/* jshint node: true */
require('dotenv').config();

var AlexaSkill = require('./src/AlexaSkill');
var APP_ID     = process.env.APP_ID;
var Util       = require('./src/util');
var Handler    = require('./src/handlers');
//Define games
var games = require('./lib/games');

//Boilerplate code....
var DrinkMaster = function(){
  AlexaSkill.call(this, APP_ID);
};

//Boilerplate code....
DrinkMaster.prototype = Object.create(AlexaSkill.prototype);
DrinkMaster.prototype.constructor = DrinkMaster;

//Boilerplate code....
DrinkMaster.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session){
  // What happens when the session starts? Optional
  console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
};

//Boilerplate code....
DrinkMaster.prototype.eventHandlers.onLaunch = function(launchRequest, session, response){
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

  Util.prepareSession(session);
  session.attributes.last_response = speech_output;
  session.attributes.last_header = header;
  // response.ask(speech_output, reprompt);
  response.askWithCard(speech_output, header, speech_output);
  // response.ask(response_text, reprompt);
  // 

  console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
};

//Boilerplate code....
//This code section defines what to do when intents are found.
DrinkMaster.prototype.intentHandlers = {
  //alexa start {game}
  StartGame: function(intent, session, response){
    Handler.handleStartGameRequest(intent, session, response);
  },
  Repeat: function(intent, session, response){
    Handler.handleRepeatRequest(intent, session, response);
  },
  DrawCard: function(intent, session, response){
    Handler.handleDrawCardRequest(intent, session, response);
  },
  AdvanceGame: function(intent, session, response){
    Handler.handleAdvanceGameRequest(intent, session, response);
  },
  StartDrinkMaster: function(intent, session, response){
    Handler.handleStartDrinkMasterRequest(intent, session, response);
  },
  StopGame: function(intent,session, response){
    Handler.handleStopGameRequest(intent, session, response);
  },
  HelpIntent: function(intent, session, response){
    var speechOutput = 'Drink Master is a series of interactive drinking games.  Saying "Drink Master Start" will begin the game selection process.';
    response.ask(speechOutput);
  }
};

//Boilerplate code....
exports.handler = function(event, context) {
  console.log(context);
    var skill = new DrinkMaster();
    skill.execute(event, context);
};
