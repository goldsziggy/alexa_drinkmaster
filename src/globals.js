/* 
* @Author: Matthew Zygowicz
* @Date:   2016-03-30 06:17:17
* @Last Modified by:   Matthew Zygowicz
* @Last Modified time: 2016-03-30 06:17:58
*/
/* jshint node: true */
'use strict';
var circle_of_death_cards = require('../lib/circle_of_death');
var games = require('../lib/games');
var never_have_i_ever_sayings = require('../lib/never_have_i_ever');
var most_likely_sayings = require('../lib/most_likely');

//*****************************************************************
// Begin global function section - @todo abstract to it's own file
//*****************************************************************

global.startCircleOfDeath = function (session){
  var deck = circle_of_death_cards.concat(circle_of_death_cards).concat(circle_of_death_cards).concat(circle_of_death_cards);
  session.attributes.deck = deck;
  session.attributes.game = 'Circle Of Death';
};

global.startNeverHaveIEver = function(session){
  session.attributes.game = 'Never Have I Ever';
  var start_index = Math.floor(Math.random()*never_have_i_ever_sayings.length);
  var arr = [];
  if(start_index > never_have_i_ever_sayings.length - 100 )
    start_index = start_index - 100;
  for(var i=0;i < 100; i++){
    arr.push(never_have_i_ever_sayings[start_index + i]);
  }
  session.attributes.sayings = arr;
};

global.startMostLikely = function(session){
  session.attributes.game = 'Most Likely';
  session.attributes.sayings = most_likely_sayings;
};