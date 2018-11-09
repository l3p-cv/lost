
export default (() => {
    // start time can be set with start function
    var startTime = null
    var locked = false
    return {
        // returns the time difference (ms) between start and elapsed and call
        elapsed: function() {
            // prevent wrong use. use elapsed after start.
            if (startTime !== null) {
                return (new Date().getTime() - startTime)
            }
        },
        // sets the start time to the current time in ms
        start: function() {
            startTime = new Date().getTime()
        },
        lock: function() {
            locked = !locked
        },
        unlock: function() {
            locked = !locked
        },
        isLocked: function() {
            return locked
        },
    }
})()