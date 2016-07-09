// Copyright 2016 Las Venturas Playground. All rights reserved.
// Use of this source code is governed by the MIT license, a copy of which can
// be found in the LICENSE file.

// Global counter for the created pickup Id.
let mockPickupId = 0;

// Mocked version of the Pickup implementation. Follows the same API, but does not actually create
// pickups on the SA-MP server.
class MockPickup {
    constructor(manager, modelId, type, position, virtualWorld) {
        this.manager_ = manager;

        if (typeof modelId !== 'number')
            throw new Error('The model Id of a pickup must be given as a number.');

        if (typeof type !== 'number')
            throw new Error('The type of a pickup must be given as a number.');

        if (typeof position !== 'object' || !(position instanceof Vector))
            throw new Error('The position of a pickup must be given as a Vector.');

        if (typeof virtualWorld !== 'number' || virtualWorld < -1 || virtualWorld > 2147483646)
            throw new Error('The virtual world of a pickup must be given as a number.');

        this.modelId_ = modelId;
        this.type_ = type;
        this.position_ = position;
        this.virtualWorld_ = virtualWorld;

        this.id_ = ++mockPickupId;

        Object.seal(this);  // prevent properties from being added or removed
    }

    // Gets the id assigned to this pickup by the SA-MP server.
    get id() { return this.id_; }

    // Returns whether the pickup still exists on the server.
    isConnected() { return this.id_ !== null; }

    // Gets the model Id used to present this pickup.
    get modelId() { return this.modelId_; }

    // Gets the type of this pickup, which defines its behaviour.
    get type() { return this.type_; }

    // Gets the position of this pickup in the world.
    get position() { return this.position_; }

    // Gets the Virtual World in which this pickup will appear.
    get virtualWorld() { return this.virtualWorld_; }

    // Utility function, only available for testing, that fakes as if the |player| entered this
    // pickup. It should cause observers to receive the onPlayerEnterPickup event.
    pickUpByPlayer(player) {
        this.manager_.onPickupPickedUp({
            playerid: player.id,
            pickupid: this.id_
        });
    }

    // Disposes of the pickup, and removes it from the server.
    dispose() {
        this.manager_.didDisposePickup(this);
        this.manager_ = null;

        this.id_ = null;
    }
}

exports = MockPickup;
