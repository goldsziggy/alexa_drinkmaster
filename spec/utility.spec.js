/* 
 * @Author: Matthew Zygowicz
 * @Date:   2016-03-25 12:33:28
 * @Last Modified by:   Matthew Zygowicz
 * @Last Modified time: 2016-03-29 12:38:46
 */
/* jshint node: true */
/* jshint jasmine: true */

'use strict';
var Util = require('../util');
var circle_of_death_cards = require('../lib/circle_of_death');
var most_likely_sayings = require('../lib/most_likely');


describe("This utiltiy functions", function() {
    describe("prepareSession", function() {
        it("returns a session that is blank", function() {
            var session = {};
            var blank_session = {};
            blank_session.attributes = {};
            blank_session.attributes.sayings = [];
            blank_session.attributes.current_saying = '';
            blank_session.attributes.deck = [];
            blank_session.attributes.current_card = {};
            blank_session.attributes.last_response = '';
            session.attributes = {};
            session.attributes.sayings = ['hi', 'yo'];
            session.attributes.current_saying = 'yo';
            session.attributes.deck = [{name: 'hi'}, {'name': 'uo'}];
            session.attributes.current_card = {name:"bless"};
            session.attributes.last_response = 'me';

            Util.prepareSession(session);
            expect(session).toEqual(blank_session);
        });
    });

    describe("drawCard", function(){
        it('sets the current_card in session', function(){
            var session = {};
            session.attributes = {};
            var card = {
                "card": 1,
                "card_title": "Ace: Rule",
                "response": "You drew an Ace! Ace is rule, set a rule to be followed, e.g. drink with your left hand, tap your head before you drink, don't use first names, etc."
            };
            session.attributes.deck = [card];
            Util.drawCard(session);
            expect(session.attributes.current_card).toEqual(card);
        });

        it('removes a card from the deck', function(){
            var session = {};
            session.attributes = {};

            // create a copy of the data (a simple = will assign by reference)
            session.attributes.deck = circle_of_death_cards.slice(0);
            Util.drawCard(session);
            expect(session.attributes.deck.length).toEqual(circle_of_death_cards.length-1);
        });

    });

    describe("pickSaying", function(){
        it('sets the current_saying', function() {
            var session = {};
            session.attributes = {};
            var saying = most_likely_sayings[1];
            session.attributes.sayings = [saying];
            Util.pickSaying(session);
            expect(session.attributes.current_saying).toEqual(saying);
        });

        it('removes a saying from sayings', function(){
            var session = {};
            session.attributes = {};

            // create a copy of the data (a simple = will assign by reference)
            session.attributes.sayings = most_likely_sayings.slice(0);
            Util.pickSaying(session);
            expect(session.attributes.sayings.length).toEqual(most_likely_sayings.length-1);
        });
    });
});