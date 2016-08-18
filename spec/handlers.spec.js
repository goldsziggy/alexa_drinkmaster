/* 
* @Author: Matthew Zygowicz
* @Date:   2016-03-30 07:13:51
* @Last Modified by:   Matthew Zygowicz
* @Last Modified time: 2016-04-07 07:01:22
*/
/* jshint node: true */
'use strict';

var games = require('../lib/games');
var Handler = require('../src/handlers');
var Event = require('../events/events');
var Response = require('../mock_response');

var mock_context = {
    succeed: function(response){
        this.response = response;
        console.log('Inside mock_context succeed');
        console.log('response: ' + response);
    }
}

describe('The handler functions', function() {
    describe('handleStartGameRequest', function() {
        it('Starts circle of death', function() {
            // var response = {};
            
            var event = Event.start_circle_of_death();
            var session = event.session;
            var response = new Response(mock_context, session);
            var intent = event.request.intent;

            Handler.handleStartGameRequest(intent, session, response);
            expect(session.attributes.game).toEqual("Circle Of Death");
            expect(session.attributes.deck.length).toEqual(52);  
        });  

        it('handles itself when no game is specified', function(){
            var expected_response = "";

            var event = Event.start_game_request_with_no_game();
            var session = event.session;
            var response = new Response(mock_context, session);
            var intent = event.request.intent;

            Handler.handleStartGameRequest(intent, session, response);
            expect(session.attributes.last_header).toEqual('DrinkMaster: Game Selection');
            for(var i = 0; i < games.length; i++){
                expect(session.attributes.last_response).toMatch(games[i]);    
            }
        });
    });

    describe('handleDrawCardRequest', function() {
        it('Draws a card', function() {
            var event = Event.draw_card_circle_of_death();
            var session = event.session;
            var response = new Response(mock_context, session);
            var intent = event.request.intent;

            Handler.handleDrawCardRequest(intent, session, response);
            expect(session.attributes.deck.length).toEqual(51);
            expect(session.attributes.current_card).toEqual (jasmine.any(Object));
        });

        it('Reacts when no game is selected', function() {
            var event = Event.start_game_request_with_no_game();
            var session = event.session;
            var response = new Response(mock_context, session);
            var intent = event.request.intent;

            Handler.handleDrawCardRequest(intent, session, response);
            expect(session.attributes.last_response).toEqual('No game currently set.  Please ask Drink Master to start.');
            expect(session.attributes.last_header).toEqual('No game found');
        });

        it('Eventually "pops" in Cirlce Of Death', function() {
            var event = Event.draw_card_circle_of_death();
            var session = event.session;
            var response = new Response(mock_context, session);
            var intent = event.request.intent;

            var has_circle_of_death_popped = false;

            while(session.attributes.deck.length > 0){
                Handler.handleDrawCardRequest(intent, session, response);
                if(session.attributes.last_header == 'Current player looses!'){
                    has_circle_of_death_popped = true;
                    break;
                }
            }
            expect(has_circle_of_death_popped).toEqual(true);
        });
    });

    describe('handleStartDrinkMasterRequest', function() {
        it('Should prompt to start', function() {
            var event = Event.start_game_request_with_no_game();
            var session = event.session;
            var response = new Response(mock_context, session);
            var intent = event.request.intent;

            Handler.handleStartDrinkMasterRequest(intent, session, response);
            expect(session.attributes.last_header).toEqual('DrinkMaster: Game Selection');
            for(var i = 0; i < games.length; i++){
                expect(session.attributes.last_response).toMatch(games[i]);    
            }
        });
    });

    describe('handleAdvanceGameRequest', function() {
        it('should advance Circle of Death', function() {
            var event = Event.draw_card_circle_of_death();
            var session = event.session;
            var response = new Response(mock_context, session);
            var intent = event.request.intent;
            
            Handler.handleAdvanceGameRequest(intent, session, response);
            expect(session.attributes.deck.length).toEqual(51);
            expect(session.attributes.current_card).toEqual (jasmine.any(Object));
        });

        it('should advance Never Have I Ever', function() {
            var event = Event.next_never_have_i_ever();
            var session = event.session;
            var response = new Response(mock_context, session);
            var intent = event.request.intent;

            Handler.handleAdvanceGameRequest(intent, session, response);
            expect(session.attributes.sayings.length).toEqual(99);
            expect(session.attributes.current_saying.length).toBeGreaterThan(1);
        });

        it('should advance Most Likely', function() {
            var event = Event.next_most_likely();
            var session = event.session;
            var response = new Response(mock_context, session);
            var intent = event.request.intent;

            Handler.handleAdvanceGameRequest(intent, session, response);
            expect(session.attributes.sayings.length).toEqual(74);
            expect(session.attributes.current_saying.length).toBeGreaterThan(1);
        });

        it('should react when nothing is selected', function() {
            var event = Event.advance_game_with_no_game();
            var session = event.session;
            session.attributes = {}; // by default, Amazon seems to populate this.
            var response = new Response(mock_context, session);
            var intent = event.request.intent;

            Handler.handleAdvanceGameRequest(intent, session, response);
            expect(session.attributes.last_response).toEqual('Invalid request.  Please ask Drink Master to start or restart');
            expect(session.attributes.last_header).toEqual('Drink Master Error');
        });
    });

    describe('handleRepeatRequest', function() {
        it('should repeat an advance game request', function() {
            var event = Event.next_never_have_i_ever();
            var session = event.session;
            var response = new Response(mock_context, session);
            var intent = event.request.intent;

            Handler.handleAdvanceGameRequest(intent, session, response);
            var last_response = session.attributes.last_response;
            var last_header = session.attributes.last_header;

            Handler.handleRepeatRequest(intent, session, response);
            expect(session.attributes.last_response).toEqual(last_response);
            expect(session.attributes.last_header).toEqual(last_header);
        });

        it('should repeat a game start instructions', function() {
            var event = Event.start_circle_of_death();
            var session = event.session;
            var response = new Response(mock_context, session);
            var intent = event.request.intent;

            Handler.handleStartGameRequest(intent, session, response);
            var last_response = session.attributes.last_response;
            var last_header = session.attributes.last_header;

            Handler.handleRepeatRequest(intent, session, response);
            expect(session.attributes.last_response).toEqual(last_response);
            expect(session.attributes.last_header).toEqual(last_header);
        });

        it('should repeat an error', function() {
            var event = Event.advance_game_with_no_game();
            var session = event.session;
            session.attributes = {};
            var response = new Response(mock_context, session);
            var intent = event.request.intent;

            Handler.handleAdvanceGameRequest(intent, session, response);
            var last_response = session.attributes.last_response;
            var last_header = session.attributes.last_header;

            Handler.handleRepeatRequest(intent, session, response);
            expect(session.attributes.last_response).toEqual(last_response);
            expect(session.attributes.last_header).toEqual(last_header);
        });
    });

    describe('handleNextSayingRequest', function() {
        it('should pick the next saying', function() {
            var event = Event.next_never_have_i_ever();
            var session = event.session;
            var response = new Response(mock_context, session);
            var intent = event.request.intent;

            Handler.handleNextSayingRequest(intent, session, response);
            expect(session.attributes.sayings.length).toEqual(99);
            expect(session.attributes.current_saying.length).toBeGreaterThan(1);
        });

        it('should react with no game selected', function() {
            var event = Event.start_game_request_with_no_game();
            var session = event.session;
            var response = new Response(mock_context, session);
            var intent = event.request.intent;

            Handler.handleNextSayingRequest(intent, session, response);
            expect(session.attributes.last_response).toEqual('Invalid request.  Please ask Drink Master to start or restart');
            expect(session.attributes.last_header).toEqual('Drink Master Error');
        });
    });

    describe('handleStopGameRequest', function(done) {
        it('should stop the game', function() {
            var my_context = {
                succeed: function(response){
                    this.response = response;
                    console.log('Inside mock_context succeed');
                    console.log('response: ' + response);
                    expect(response.response.outputSpeech.text).toEqual("Thank you for playing Drink Master.  I hope you had a most excellent time!");
                    done();
                }
            }
            var event = Event.next_never_have_i_ever();
            var session = event.session;
            var response = new Response(my_context, session);
            var intent = event.request.intent;

            Handler.handleStopGameRequest(intent, session, response);
            // console.log(response._context);
            // expect(response._context.response.response.outputSpeech.text).toEqual("Thank you for playing Drink Master.  I hope you had a most excellent time!");
        });
    });
});