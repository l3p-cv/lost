import { BROWSER_NAME } from "l3p-core"
// import "shared/cursors.scss"

export const CURSOR_UPDATE_FREQ = 60

/**
* data related to box events (create, resize).
*/
export const EVENT_COMPUTATION_SETTINGS = {
    boxCreate: {
        MIN_DRAW_TIME: 130,
        UPDATE_FREQ: 1000 / 60,
        VALIDATE_FREQ: 10
    },
    boxChange: {
        CURSOR_UPDATE_FREQ: 60,
        UPDATE_FREQ: 1000 / 60,
        GRAB_CURSOR_FADEOUT_TIME: 200,
    },
}

/**
* the drawable state. important for sending updates to backend.
*/
// @todo: replace "DATABASE" with "DATABASE"
// @todo: replace strings with numbers.
/*
    @introduced on rule handling improvment, label change. 02.05.2018
    NEW says NEW
    DATABASE can become DELETED
    DATABASE can be mixed with: CHANGED
        - used for internal config-acthion-rules-handling
        - when sending back only send CHANGED
    => see DrawableModel.getResponseData, .setChanged, .delete, .resize
*/
export const STATE = {
    // DATABASE: "database",
    DATABASE: "database",
    NEW: "new",
    CHANGED: "changed",
    DELETED: "deleted",
}

