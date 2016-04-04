/* 
* @Author: Matthew Zygowicz
* @Date:   2016-03-30 06:18:06
* @Last Modified by:   Matthew Zygowicz
* @Last Modified time: 2016-03-30 06:31:50
*/
/* jshint node: true */
/* jshint jasmine: true */
'use strict';
//*****************************************************************
// This file tests the specifications around the globals.js file.
//*****************************************************************

require('../src/globals');

describe('The Global functions are set and work.', function() {
    describe('startCircleOfDeath', function() {
        it('Should set the deck', function() {
            var session = {};
            session.attributes = {};
            global['startCircleOfDeath'](session);

            expect(session.attributes.deck.length).toEqual(52);
            expect(session.attributes.game).toEqual('Circle Of Death');
        });
    });

    describe('startNeverHaveIEver', function() {
        it('Should set the sayings', function() {
            var session = {};
            session.attributes = {};

            global['startNeverHaveIEver'](session);

            expect(session.attributes.sayings.length).toEqual(100);
            expect(session.attributes.game).toEqual("Never Have I Ever");
        });
    });

    describe('startMostLikely', function() {
        it('Should set the sayings', function() {
            var session = {};
            session.attributes = {};

            global['startMostLikely'](session);

            expect(session.attributes.game).toEqual("Most Likely");
            expect(session.attributes.sayings.length).toBeGreaterThan(1);
        });
    });
});         