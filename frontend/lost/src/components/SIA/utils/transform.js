export function toSia(data, image, type){
    console.info('toSia data',data)
    console.info('toSia image',image)
    switch(type) {
        case 'bBox':
            const w = image.width * data.w
            const h = image.height * data.h
            const x0 = image.width * data.x - w/2.0
            const y0 = image.height * data.y - h/2.0
            return [
                {
                    x: x0,
                    y: y0
                },
                {
                    x: x0 + w,
                    y: y0
                },
                {
                    x: x0 + w,
                    y: y0 + h
                },
                {
                    x: x0,
                    y: y0 + h
                }
            ]
        case 'point':
            return [{
                x: image.width * data.x,
                y: image.height * data.y
            }]
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

/**
 * Transform a sia annotation to backend format.
 * 
 * @param {Array} data Annotation data
 * @param {*} image Image object {width, height}
 * @param {String} type Type of the annotation bBox, point, line, polygon
 * @returns Annotation data in backend style (relative, centered)
 */
export function toBackend(data, image, type){
    console.log('toBackend image', image)
    switch(type) {
        case 'bBox':
            // const w = image.width * data.w
            // const h = image.height * data.h
            // const x0 = image.width * data.x - w/2.0
            // const y0 = image.height * data.y - h/2.0
            const w = data[1].x - data[0].x
            const h = data[2].y - data[0].y
            const x = data[0].x + w/2.0
            const y = data[0].y + h/2.0
            return {
                x:x/image.width,
                y:y/image.height,
                w:w/image.width,
                h:h/image.height}
        case 'point':
            return {
                x: data[0].x/image.width,
                y: data[0].y/image.height
            }
        case 'line':
        case 'polygon':
            return data.map((e) => {
                return {
                    x: e.x/ image.width,
                    y: e.y/ image.height
                }
            })
        default:
            console.warn("Wrong annotation type!")
        
    }
}

export function move(data, movementX, movementY){
    return data.map(e => {
        return {
            x: e.x + movementX,
            y: e.y + movementY
        }
    })
}


export function getBox(data, type){
    
    switch(type) {
        case 'bBox':
            return data
        case 'point':
            // console.error("There is no box definition for a point!")
        case 'line':
        case 'polygon':
            let maxX = 0
            let maxY = 0
            let minX = Infinity
            let minY = Infinity
            data.forEach(el => {
                if (el.x > maxX) maxX = el.x
                if (el.y > maxY) maxY = el.y
                if (el.x < minX) minX = el.x
                if (el.y < minY) minY = el.y
            })
            return [
                {x:minX, y:minY}, {x:maxX, y:minY},
                {x:minX, y:maxY}, {x:maxX, y:maxY}
            ]
            
        default:
            console.log("Wrong annotation type!")
        
    }
}

export function getCenter(data, type){
    let box = undefined
    switch(type) {
        case 'point':
            return data[0]
        case 'line':
        case 'polygon':
        case 'bBox':
            console.log('getCenter ', data)
            box = getBox(data, type)
            const w = box[1].x - box[0].x
            const h = box[3].y - box[0].y
            return {
                x: box[0].x + w/2.0,
                y: box[0].y + h/2.0
            }  
        default:
            console.log("Wrong annotation type!")
        
    }
}

/**
 * Check if all nodes of an annotation are within the image. If not,
 * correct the annotation
 * @param {object} data 
 * @param {object} image 
 */
export function correctAnnotation(data, image){
    const corrected = data.map(el => {
            let x = el.x
            let y = el.y
            if (el.x <= 0){
                x = 0
            } else if (el.x > image.width){
                x = image.width
            }
            if (el.y < 0){
                y = 0
            } else if (el.y > image.height){
                y = image.height
            }
            return {x:x,y:y}
        })
    return corrected
}