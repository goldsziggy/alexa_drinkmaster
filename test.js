/* 
* @Author: ziggy
* @Date:   2016-03-10 05:56:05
* @Last Modified by:   Matthew Zygowicz
* @Last Modified time: 2016-03-13 12:47:08
* This files objective is a sandbox for miscellanious testing.
*/

'use strict';
require('dotenv').config();
var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : process.env.AMZN_RDS_HOST,
    user     : process.env.AMZN_RDS_USER,
    password : process.env.AMZN_RDS_PASS,
    database : process.env.AMZN_RDS_DB
  });
connection.connect();
// connection.query("DROP TABLE drinkmaster_state;");
// connection.query("CREATE TABLE drinkmaster_state (id INT AUTO_INCREMENT PRIMARY KEY, userId VARCHAR (255) NOT NULL, state BLOB NOT NULL, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
var user = 'hello';
var state = {
  foo: 'bar',
  bar: {
    blah: 'grah'
  }
};
var json = JSON.stringify(state);
// var blob = new Blob([json], {type: "application/json"});
// connection.query('INSERT INTO drinkmaster_state (userId, state) VALUES (?,?)', [user, json]);
connection.query('SELECT userId, state, timestamp FROM drinkmaster_state ', function(err, rows, fields){
  console.log(rows);
  for(var i = 0; i < rows.length; i++){
    console.log('------------------------');
    console.log('userId: ' + rows[i].userId);
    console.log('timestamp: ' + rows[i].timestamp);
    console.log(JSON.parse(rows[i].state));
  }
})
connection.end();
// var http       = require('https')
//   , request    = require('request')
//   , fs         = require('fs')
//   , cheerio    = require('cheerio')
//   , AlexaSkill = require('./AlexaSkill')
//   , fuzzy      = require('fuzzy')
//   , APP_ID     = process.env.APP_ID

// var api_route = "/api/v2";

// var sess = {attributes: {
//   deck:{
//     length: 30
//   }
// }};

// var writeFile = function(arr){
//   var file = fs.createWriteStream('array.json');
//   console.log(arr);
//   file.on('error', function(err) { /* error handling */ });
//   arr.forEach(function(v) { file.write(v.join(', ') + '\n'); });
//   file.end();
// }

// var isCircleOfDeathExplosion = function(session){
//   console.log('inside isCircleOfDeathExplosion');
//   var num = Math.random();
//   // console.log(num);
//   // console.log(1/session.attributes.deck.length);

//   return (num < 1/session.attributes.deck.length * 3);
// };

