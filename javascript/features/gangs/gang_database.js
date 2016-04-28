// Copyright 2016 Las Venturas Playground. All rights reserved.
// Use of this source code is governed by the MIT license, a copy of which can
// be found in the LICENSE file.

const Gang = require('features/gangs/gang.js');

// Query for loading a gang's information for a specific player.
const LOAD_GANG_FOR_PLAYER_QUERY = `
    SELECT
        users_gangs.user_role,
        gangs.*
    FROM
        users_gangs
    LEFT JOIN
        gangs ON gangs.gang_id = users_gangs.gang_id
    WHERE
        users_gangs.user_id = ? AND
        users_gangs.gang_id = ?`;

// Query to determine whether any gang currently exists for a given name or tag.
const GANG_EXISTS_QUERY = `
    SELECT
        gangs.gang_tag,
        gangs.gang_name
    FROM
        gangs
    WHERE
        gangs.gang_deleted IS NULL AND
        (LOWER(gangs.gang_tag) = ? OR LOWER(gangs.gang_name) = ?)
    LIMIT
        1`;

// Query to actually create a gang in the database.
const GANG_CREATE_QUERY = `
    INSERT INTO
        gangs
        (gang_tag, gang_name, gang_goal)
    VALUES
        (?, ?, ?)`;

// Query to add a member to a given gang in the database.
const GANG_CREATE_MEMBER_QUERY = `
    INSERT INTO
        users_gangs
        (user_id, gang_id, user_role, joined_gang)
    VALUES
        (?, ?, ?, NOW())`;

// The gang database is responsible for interacting with the MySQL database for queries related to
// gangs, e.g. loading, storing and updating the gang and player information.
class GangDatabase {
    constructor(database) {
        this.database_ = database;
    }

    // Loads information for |gangId| from the perspective of |userId| from the database. Returns a
    // promise that will be resolved when the information is available.
    loadGangForPlayer(userId, gangId) {
        return this.database_.query(LOAD_GANG_FOR_PLAYER_QUERY, userId, gangId).then(results => {
            if (results.rows.length !== 1)
                return null;

            const info = results.rows[0];
            return {
                role: toRoleValue(info.user_role),
                gang: {
                    id: info.gang_id,
                    tag: info.gang_tag,
                    name: info.gang_name,
                    goal: info.gang_goal,
                    color: info.gang_color
                }
            };
        });
    }

    // Returns a promise that will be resolved with an object indicating whether any gang exists
    // having the |tag| or |name|. Both the tag and name will be lowercased.
    doesGangExists(tag, name) {
        tag = tag.toLowerCase();
        name = name.toLowerCase();

        return this.database_.query(GANG_EXISTS_QUERY, tag, name).then(results => {
            if (results.rows.length === 0)
                return { available: true };

            const info = results.row[0];
            return {
                available: false,
                tag: info.gang_tag,
                name: info.gang_name
            };
        });
    }

    // Creates a gang having the |tag|, named |name| pursuing |goal|, and returns a promise that
    // will be resolved with the gang's information when the operation has completed. The |player|
    // shall be stored in the database as the gang's leader.
    createGangWithLeader(player, tag, name, goal) {
        let gangId = null;

        return this.database_.query(GANG_CREATE_QUERY, tag, name, goal).then(results => {
            if (results.insertId === null)
                throw new Error('Unexpectedly got NULL as the inserted Id.');

            gangId = result.insertId;

            return this.database_.query(
                GANG_CREATE_MEMBER_QUERY, player.userId, result.insertId, 'Leader');

        }).then(results => {
            return {
                id: gangId,
                tag: tag,
                name: name,
                goal: goal,
                color: null
            };
        });
    }

    // Utility function for converting a role string to a Gang.ROLE_* value.
    static toRoleValue(role) {
        switch (role) {
            case 'Leader':
                return Gang.ROLE_LEADER;
            case 'Manager':
                return Gang.ROLE_MANAGER;
            case 'Member':
                return Gang.ROLE_MEMBER;
            default:
                throw new Error('Invalid gang role: ' + role);
        }
    }

    // Utility function for converting a Gang.ROLE_* value to a role string.
    static toRoleString(role) {
        switch (role) {
            case Gang.ROLE_LEADER:
                return 'Leader';
            case Gang.ROLE_MANAGER:
                return 'Manager';
            case Gang.ROLE_MEMBER:
                return 'Member';
            default:
                throw new Error('Invalid gang role: ' + role);
        }
    }
}

// Values that can be returned by the GangDatabase.doesGangExist() method.
GangDatabase.EXISTS_AVAILABLE = 0;
GangDatabase.EXISTS_TAG = 1;
GangDatabase.EXISTS_NAME = 2;

exports = GangDatabase;