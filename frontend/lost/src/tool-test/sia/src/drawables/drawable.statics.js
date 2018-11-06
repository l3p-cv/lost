export const CURSOR_UPDATE_FREQ = 60

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

export const STATE = {
    DATABASE: "database",
    NEW: "new",
    CHANGED: "changed",
    DELETED: "deleted",
}

