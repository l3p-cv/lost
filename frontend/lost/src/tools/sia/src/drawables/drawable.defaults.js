import * as math from "shared/math"

export const LABEL = {
    id: -1,
    name: "no label",
    description: "no description"
}

export default {
    label: LABEL,
    strokeWidth: math.floorEven(4),
    opacity: {
        selected: {
            fill: 0,
            stroke: 1,
        },
        notSelected: {
            fill: 0.1,
            stroke: 0.5,
        }
    },
} 
