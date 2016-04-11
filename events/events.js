/* 
* @Author: Matthew Zygowicz
* @Date:   2016-03-30 06:44:11
* @Last Modified by:   Matthew Zygowicz
* @Last Modified time: 2016-04-07 06:36:51
*/
/* jshint node: true */
'use strict';
require('dotenv').config();

var e_draw_card_cirlce_of_death = require('./draw_card_circle_of_death');
var e_next_most_likely = require('./next_most_likely');
var e_next_never_have_i_ever = require('./next_never_have_i_ever');
var e_advance_game_with_no_game = require('./advance_game_with_no_game');
var e_repeat_circle_of_death = require('./repeat_circle_of_death');
var e_start_circle_of_death = require('./start_circle_of_death');
var e_start_never_have_i_ever = require('./start_never_have_i_ever');
var e_start_game_request_with_no_game = require('./start_game_request_with_no_game');


//************************************************************************************
// This file takes the event JSON files and adds account specific information to them
//***********************************************************************************

var add_env_to_event = function(event){
    event.session.sessionId = process.env.TEST_SESSION_ID;
    event.session.application.applicationId = process.env.TEST_APP_ID;
    event.session.user.userId = process.env.TEST_USER_ID;
};

exports.draw_card_circle_of_death = function(){
    add_env_to_event(e_draw_card_cirlce_of_death);
    return  (JSON.parse(JSON.stringify(e_draw_card_cirlce_of_death))); //clever method of cloning variables http://heyjavascript.com/4-creative-ways-to-clone-objects/
};

exports.next_never_have_i_ever = function(){
    add_env_to_event(e_next_never_have_i_ever);
    return (JSON.parse(JSON.stringify(e_next_never_have_i_ever)));
};

exports.next_most_likely = function(){
    add_env_to_event(e_next_most_likely);
    return (JSON.parse(JSON.stringify(e_next_most_likely)));
};

exports.advance_game_with_no_game = function(){
    add_env_to_event(e_advance_game_with_no_game);
    return (JSON.parse(JSON.stringify(e_advance_game_with_no_game)));
};

exports.repeat_circle_of_death = function(){
    add_env_to_event(e_repeat_circle_of_death);
    return ((JSON.parse(JSON.stringify(e_repeat_circle_of_death))));
};

exports.start_circle_of_death = function(){
    add_env_to_event(e_start_circle_of_death);
    return((JSON.parse(JSON.stringify(e_start_circle_of_death))));
};

exports.start_never_have_i_ever = function(){
    add_env_to_event(e_start_never_have_i_ever);
    return (JSON.parse(JSON.stringify(e_start_never_have_i_ever)));
};

exports.start_game_request_with_no_game = function(){
    add_env_to_event(e_start_game_request_with_no_game);
    return (JSON.parse(JSON.stringify(e_start_game_request_with_no_game)));
};