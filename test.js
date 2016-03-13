/* 
* @Author: ziggy
* @Date:   2016-03-10 05:56:05
* @Last Modified by:   Matthew Zygowicz
* @Last Modified time: 2016-03-13 12:47:08
* This files objective is a sandbox for miscellanious testing.
*/

'use strict';
require('dotenv').config();
var http       = require('https')
  , request    = require('request')
  , fs         = require('fs')
  , cheerio    = require('cheerio')
  , AlexaSkill = require('./AlexaSkill')
  , fuzzy      = require('fuzzy')
  , APP_ID     = process.env.APP_ID

var api_route = "/api/v2";

var sess = {attributes: {
  deck:{
    length: 30
  }
}};

var writeFile = function(arr){
  var file = fs.createWriteStream('array.json');
  console.log(arr);
  file.on('error', function(err) { /* error handling */ });
  arr.forEach(function(v) { file.write(v.join(', ') + '\n'); });
  file.end();
}

var isCircleOfDeathExplosion = function(session){
  console.log('inside isCircleOfDeathExplosion');
  var num = Math.random();
  // console.log(num);
  // console.log(1/session.attributes.deck.length);

  return (num < 1/session.attributes.deck.length * 3);
};

