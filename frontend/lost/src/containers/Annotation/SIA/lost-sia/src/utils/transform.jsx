export function toSia(data, image, type, imgOffset){
    switch(type) {
        case 'bBox':
            const w = image.width * data.w
            const h = image.height * data.h
            const x0 = imgOffset.x + image.width * data.x - w/2.0
            const y0 = imgOffset.y + image.height * data.y - h/2.0
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
                x: imgOffset.x + image.width * data.x,
                y: imgOffset.y + image.height * data.y
            }]
        case 'line':
        case 'polygon':
            return data.map((e) => {
                return {
                    x: imgOffset.x + image.width * e.x,
                    y: imgOffset.y + image.height * e.y
                }
            })
        default:
        
    }
}

/**
 * Transform a sia annotation to backend format.
 * 
 * @param {Array} data Annotation data
 * @param {*} svg Image object {width, height}
 * @param {String} type Type of the annotation bBox, point, line, polygon
 * @returns Annotation data in backend style (relative, centered)
 */
export function toBackend(data, svg, type, imgOffset={x:0,y:0}){
    const imgWidth = svg.width - 2*imgOffset.x
    const imgHeight = svg.height - 2*imgOffset.y
    switch(type) {
        case 'bBox':
            // const w = svg.width * data.w
            // const h = svg.height * data.h
            // const x0 = svg.width * data.x - w/2.0
            // const y0 = svg.height * data.y - h/2.0

            // console.error('GO On Here! w = max_x - min_x; h = max_y - min_y')
            const xList = data.map(e => {return e.x})
            const yList = data.map(e => {return e.y})
            const minX = Math.min(...xList) - imgOffset.x
            const maxX = Math.max(...xList) - imgOffset.x
            const minY = Math.min(...yList) - imgOffset.y
            const maxY = Math.max(...yList) - imgOffset.y
            const w = maxX - minX
            const h = maxY - minY
            const x = minX + w/2.0
            const y = minY + h/2.0
            return {
                x:x/imgWidth,
                y:y/imgHeight,
                w:w/imgWidth,
                h:h/imgHeight}
        case 'point':
            return {
                x: (data[0].x - imgOffset.x)/imgWidth,
                y: (data[0].y - imgOffset.y)/imgHeight
            }
        case 'line':
        case 'polygon':
            return data.map((e) => {
                return {
                    x: (e.x - imgOffset.x)/ imgWidth,
                    y: (e.y - imgOffset.y)/ imgHeight
                }
            })
        default:
            console.warn("Wrong annotation type!")
        
    }
}

export function getMinMaxPoints(data){
    const xList = data.map(e => {return e.x})
    const yList = data.map(e => {return e.y})
    const minPoint = {x:Math.min(...xList), y:Math.min(...yList)}
    const maxPoint = {x:Math.max(...xList), y:Math.max(...yList)}
    return [minPoint, maxPoint]
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
            box = getBox(data, type)
            const w = box[1].x - box[0].x
            const h = box[3].y - box[0].y
            return {
                x: box[0].x + w/2.0,
                y: box[0].y + h/2.0
            }  
        default:
        
    }
}

/**
 * Get point that is closest to the left browser side.
 * 
 * @param {object} data list of points {x,y} 
 * @returns {object} A list of point [{x,y}...]. Multiple points are
 *  returned when multiple points have the same distance to the left side.
 */
export function getMostLeftPoint(data){
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
 * @param {object} imageOffset 
 */
export function correctAnnotation(data, image, imageOffset){
    const imgWidth = image.width - 2*imageOffset.x
    const imgHeight = image.height - 2*imageOffset.y
    const corrected = data.map(el => {
            let x = el.x
            let y = el.y
            if (el.x <= imageOffset.x ){
                x = imageOffset.x
            } else if (el.x > (imgWidth + imageOffset.x)){
                x = imgWidth + imageOffset.x
            }
            if (el.y < imageOffset.y){
                y = imageOffset.y
            } else if (el.y > (imgHeight + imageOffset.y)){
                y = imgHeight + imageOffset.y
            }
            return {x:x,y:y}
        })
    return corrected
}

/**
 * Rotate annotation around center.
 * @param {*} data list of points {x:int,y:int} 
 * @param {*} center Center to rotate point 
 * @param {*} angle Rotation angle
 */
export function rotateAnnotation(data, center, angle){
    angle = (angle ) * (Math.PI/180); // Convert to radians
    const rotated = data.map(point => {
        return {
            x: Math.round(Math.cos(angle) * (point.x - center.x) - Math.sin(angle) * (point.y-center.y) + center.x),
            y: Math.round(Math.sin(angle) * (point.x - center.x) + Math.cos(angle) * (point.y - center.y) + center.y)
        }
    })
    return rotated;
}

/**
 * Resize annotation data in canvas format to new image size
 * @param {*} data Annotation data in canvas format [{x:int, y:int},...]
 * @param {*} sizeOld Size of old image {width:int, height:int}
 * @param {*} sizeNew Size of new image {width:int, height:int}
 */
export function resizeAnnoData(data, sizeOld, sizeNew){
    const xRatio = sizeNew.width / sizeOld.width
    const yRatio = sizeNew.height / sizeOld.height
    return data.map(e => {
        return {
            x: parseInt(e.x*xRatio),
            y: parseInt(e.y*yRatio)
        }
    })
}