
export function toSia(data, image, type){
    
    switch(type) {
        case 'bBox':
            const w = image.width * data.w
            const h = image.height * data.h
            return {
                x: image.width * data.x - w/2.0,
                y: image.height * data.y - h/2.0,
                w: w,
                h: h
            }
        case 'point':
        case 'line':
        case 'polygon':
            return data.map((e) => {
                return {
                    x: image.width * e.x,
                    y: image.height * e.y
                }
            })
        default:
            console.log("Wrong annotation type!")
        
    }
}