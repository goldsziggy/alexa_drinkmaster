/* 
* @Author: ziggy
* @Date:   2016-03-10 05:56:05
* @Last Modified by:   Matthew Zygowicz
* @Last Modified time: 2016-03-12 11:00:03
* This files objective is a sandbox for miscellanious testing.
*/

'use strict';
require('dotenv').config();
var http       = require('https')
  , AlexaSkill = require('./AlexaSkill')
  , fuzzy      = require('fuzzy')
  , APP_ID     = process.env.APP_ID
  , HABIT_KEY    = process.env.HABIT_KEY
  , HABIT_USER    = process.env.HABIT_USER
  , BASE_URL    = process.env.BASE_URL;

var api_route = "/api/v2";

var qualifiers = require('./intent-slots/qualifier');
console.log(qualifiers);

var request_headers = {
  'Content-Type': 'application/json',
  'x-api-user':  HABIT_USER,
  'x-api-key': HABIT_KEY,
  accept: '*/*'
}

var options_get_all_tasks = {
  host: BASE_URL,
  path: api_route + '/user/tasks',
  headers:request_headers,
  method: 'GET'
};

var fuzzy_search_options = {
  pre: '<'
  , post: '>'
  , extract: function(el) { return el.text; }
}

var request_all_tasks = function(callback){
  console.log("entered request_all_tasks");
    
  http.request(options_get_all_tasks, function(res) {
    var body = ''
    console.log("request recieved a response!");
    res.on('data', function(data){
      body += data;
    });

    res.on('end', function(){
      var result = JSON.parse(body);
      callback(result);
    });
  }).on('error', function(e){
    console.log('Error: ' + e);
  }).end();
}




request_all_tasks(function(data){
    console.log("entered handleGetAllTasksRequest");
    console.log("DATA is: " + data);

    
    
    var results = fuzzy.filter("fifty", data, fuzzy_search_options);
    console.log(results);
});