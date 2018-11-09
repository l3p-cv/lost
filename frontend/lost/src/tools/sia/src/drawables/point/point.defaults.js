export const baseRadius = 4
export function getRadius(isNoAnnotation, baseRadiusOverride){
    return isNoAnnotation 
        ? 0
        : baseRadiusOverride ? baseRadiusOverride : baseRadius
}
export function getOutlineRadius(isNoAnnotation, baseRadiusOverride){
    return isNoAnnotation 
        ? baseRadiusOverride ? baseRadiusOverride + 2 : baseRadius + 2
        : baseRadiusOverride ? baseRadiusOverride + 6 : baseRadius + 6
}
export let strokeWidth = baseRadius
export const opacity = {
    selected: {
        fill: 1,
        stroke: 0.3,
    },
    notSelected: {
        fill: 0.5,
        stroke: 0.5,
    }
}
