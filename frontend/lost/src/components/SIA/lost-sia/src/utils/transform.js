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

/**
 * Get area relative to the image 
 * 
 * @param {Array} data Annotation data
 * @param {*} scaledImg The scaled image object {width, height}
 * @param {String} type Type of the annotation bBox, point, line, polygon
 * @param {object} originalImg The original image
 * @returns Area relative
 */
export function getArea(data, scaledImg, type, originalImg){
    const relData = toBackend(data, scaledImg, type)
    switch(type) {
        case 'bBox':
            return Math.abs(relData.w*relData.h)* originalImg.width*originalImg.height
            // return relData.w*relData.h
        case 'line':        
        case 'point':
            return undefined
        case 'polygon':
            let area = 0.0;         // Accumulates area in the loop
            if (relData.length >2){
                let j = relData.length-1;  // The last vertex is the 'previous' one to the first
            
                for (let i=0; i<relData.length; i++)
                { 
                    area = area +  (relData[j].x+relData[i].x) * (relData[j].y-relData[i].y); 
                    j = i;  //j is previous vertex to i
                }
            }
            return Math.abs(area/2) * originalImg.width*originalImg.height
        default:
            console.warn("Wrong annotation type!")
            return undefined
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
            break
        
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
 * Get point that is closest to the left browser side.
 * 
 * @param {object} data list of points {x,y} 
 * @returns {object} A list of point [{x,y}...]. Multiple points are
 *  returned when multiple points have the same distance to the left side.
 */
export function getMonstLeftPoint(data){
    let minX = Infinity
    let minXList = []    
    data.forEach(el => {
        if (el.x < minX){
            minX = el.x
            minXList = []
            minXList.push(el)
        } else if (el.x === minX) {
            minXList.push(el)
        }
    })
    return minXList
}

/**
 * Get point that is closest to the top of the browser.
 * 
 * @param {object} data list of points {x,y} 
 * @returns {object} A list of point [{x,y}...]. Multiple points are
 *  returned when multiple points have the same distance to the top.
 */
export function getTopPoint(data){
    let minY = Infinity
    let minYList = []    
    data.forEach(el => {
        if (el.y < minY){
            minY = el.y
            minYList = []
            minYList.push(el)
        } else if (el.y === minY) {
            minYList.push(el)
        }
    })
    return minYList
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