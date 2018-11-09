export const NUMBER_TYPE = {
    NATURAL : 0,
    WHOLE : 1,
    RATIONAL : 2,
}
const { NATURAL, WHOLE } = NUMBER_TYPE

/**
 * 
 */
export function ceilEven(value: Number, options: any){
    options = options === undefined ? {} : options
    options.up = true
    options.numberType = WHOLE
    return makeEven(value, options)
}
export function floorEven(value: Number, options: any){
    options = options === undefined ? {} : options
    options.up = false
    options.numberType = WHOLE
    return makeEven(value, options)
}
export function makeEven(value: Number, options: any){
    // options handling
    const DEFAULTS = {
        up: false,
        numberType: NATURAL,
    }
    options = Object.assign({}, DEFAULTS, options)
    let { numberType, up } = options
    const down = !up
    const isNegative = (value < 0)
    const isPositive = !isNegative
    numberType = isNegative ? WHOLE : NATURAL
    value = Math.floor(value)

    // decision and calculation
    switch(numberType){
        case NATURAL:
            if((value % 2) > 0) {
                if(up) {
                    return value + 1 
                }
                else if(down && value === 0) {
                    return 0
                }
                else if(down){
                    return value - 1
                }
            } 
            else {
                return value
            }
            break
        case WHOLE:
            if(Math.abs(value % 2) > 0) {
                if(up && isPositive){
                    return value + 1
                }
                else if(up && isNegative){
                    return value - 1
                }
                else if(down && isPositive){
                    return value - 1
                }
                else if(down && isNegative){
                    return value + 1
                }
            } else {
                return value
            }
            break
    }
}
export const even = makeEven