export const MOUSE_BTN = {
    isLeft: btn => btn === 0,
    isRight: btn => btn === 2 || btn === 3,
    isMid: btn => btn === 4,
}

/**
* get the mouseposition (0,0) starts on parent element of
* the event target or the element given with the second argument.
*/
let x = undefined
let y = undefined
let rect = undefined
export const getMousePosition = (event, parentNode) => {
    // use the event targets parent element or a custom one.
    rect = (parentNode !== undefined)
    ? parentNode.getBoundingClientRect()
    : event.target.parentNode.getBoundingClientRect()

    x = (event.clientX - rect.left)
    x = Math.round(x)
    y = (event.clientY - rect.top)
    y = Math.round(y)

    return { x, y }
}
