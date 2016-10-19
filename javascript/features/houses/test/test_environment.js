// Copyright 2016 Las Venturas Playground. All rights reserved.
// Use of this source code is governed by the MIT license, a copy of which can
// be found in the LICENSE file.

const Abuse = require('features/abuse/abuse.js');
const Economy = require('features/economy/economy.js');
const Houses = require('features/houses/houses.js');
const MockAnnounce = require('features/announce/test/mock_announce.js');
const MockFriends = require('features/friends/test/mock_friends.js');
const MockGangs = require('features/gangs/test/mock_gangs.js');
const MockLocation = require('features/location/test/mock_location.js');
const MockPlayground = require('features/playground/test/mock_playground.js');
const Settings = require('features/settings/settings.js');
const Streamer = require('features/streamer/streamer.js');

// Exports a function that fully initializes a test environment for the houses feature.
exports = async function createTestEnvironment() {
    server.featureManager.registerFeaturesForTests({
        abuse: Abuse,
        announce: MockAnnounce,
        economy: Economy,
        friends: MockFriends,
        gangs: MockGangs,
        houses: Houses,
        location: MockLocation,
        playground: MockPlayground,
        settings: Settings,
        streamer: Streamer
    });

    server.featureManager.loadFeature('houses');

    const abuse = server.featureManager.getFeatureForTests('abuse');
    const houses = server.featureManager.getFeatureForTests('houses');
    const streamer = server.featureManager.getFeatureForTests('streamer');

    await houses.manager_.ready;

    return {
        abuse: abuse,
        commands: houses.commands_,
        manager: houses.manager_,
        streamer: streamer
    };
};
