

// INTERFACE
export function getColorTable(image: Image, labels: Array<String>, options: any){
    const bufferCanvas = document.createElement("canvas")
    const bufferContext = bufferCanvas.getContext("2d")

    const accuracy = options && options.accuracy ? options.accuracy : 1

    bufferCanvas.width = image.width
    bufferCanvas.height = image.height
    bufferContext.drawImage(image, 0, 0)
    // This function is allready called on image load. So i can just call getImageData() here.
    const data = bufferContext.getImageData(0, 0, image.width, image.height).data
    
    const hsl = getAverageHsl(data, accuracy)
    const colors = getDistinctColors(hsl, labels.length)
    // console.log(colors)

    // map a acolor to every label
    const colorMap = new Map()
    const labelIds = labels.map(l => l.id)
    labelIds.forEach((id, idx) => {
        colorMap.set(id, colors[idx])
    })
    // console.log(colorMap)
    return {
        colorMap, bufferCanvas, bufferContext
    }
}

function getAverageRgb(data: ImageData, accuracy: Number){
    // data = Array.from(data)
    // let accuracy = 1 // @todo: use
    accuracy = accuracy || 1
    let pixelCount = data.length / 4 / accuracy
    // console.log("number of rgb values to calculate with:", pixelCount)
    // the data is in RGBA format, accumulate RGB values in each step.
    let sumRed = 0, sumGreen = 0, sumBlue = 0
    // let alpha = 0
    for(let i = 0; i < data.length; i+=4*accuracy){
        // alpha += data[i+3]
        // if(data[i+3] === 255){
            sumRed += data[i]
            sumGreen += data[i+1]
            sumBlue += data[i+2]
        // }
        // else {
        //     sumRed += data[i] * (data[i+3] / 255)
        //     sumGreen += data[i+1] * (data[i+3] / 255)
        //     sumBlue += data[i+2] * (data[i+3] / 255)
        // }
    }
    // console.log("avg alpha:", alpha / pixelCount)
    let avgRed = sumRed / pixelCount
    let avgGreen = sumGreen / pixelCount
    let avgBlue = sumBlue / pixelCount
    return { R: Math.round(avgRed), G: Math.round(avgGreen), B: Math.round(avgBlue), toString: toRgbaString  }
}
function getAverageHsl(data: ImageData, accuracy: Number){
    let rgb = getAverageRgb(data, accuracy)
    console.log(rgb)
    console.log(`average color: ${toRgbaString(rgb, 1)}`)
    console.log("%c                                ", `background: ${toRgbaString(rgb, 1)}`)
    return toHsl(rgb)
}
function getDistinctColors(color: hslColor, labelCnt: Number){
    let { H, S, L } = color
    /*  segmentation of 180 hue
    ------------------------------
    get number
    x1 = 1
    x2 = 3 = 1 + 2^1
    x3 = 5 = 1 + 2^2
    x4 = 9 = 1 + 2^3
    // x1 = 1
    xn = 1 + 2^n-1

    if: label > 4
    x * 2 = 18
    if: label > 18
    x * 2 = 36
    */
    if(labelCnt > 54){
        alert(`Could not generate sufficient colors. Number of labels = ${labelCnt}, Please contact the developer.`)
    }

    let hValues = []

    // 1. DETERMINE HUE VALUES
    /*  circle calculation
    360/0   -> 90, 270 | addition -> x+90 % 360
    300     -> 30, 210
    160     -> 250, 70
    80      -> 170, 10 | subtraktion -> abs(x-90)
    */
    // -------------------------------------------------------------------------
    let rangeA = (H + 90) % 360
    let rangeB = Math.abs(H - 90)
    let rangeMin = Math.min(rangeA, rangeB)
    let rangeMax = Math.max(rangeA, rangeB)
    // console.log("H: ", H)
    // console.log("rangeMin:", rangeMin)
    // console.log("rangeMax:", rangeMax)

    // initial color value always exists
    hValues.push(((H + 180) % 360))

    if(labelCnt > 1 || labelCnt >= 3){
        hValues.push(((H + 90) % 360))
        hValues.push(Math.abs(H - 90))
        if(labelCnt > 3 || labelCnt >= 5){
            hValues.push(((rangeMin + 45) % 360))
            hValues.push(Math.abs(rangeMax - 45))
            if(labelCnt > 5 || labelCnt >= 9){
                hValues.push(((rangeMin + 22.5) % 360))
                hValues.push(Math.abs(rangeMax - 22.5))
                hValues.push(((rangeMin + 45 + 22.5) % 360))
                hValues.push(Math.abs(rangeMax - 45 - 22.5))
            }
        }
    }


    // 2. DETERMINE LIGHTNESS AND SATURATION MODIFICATORS
    // @ŧodo: improve the lightness and saturation to make better colors.
    // bring in more logic to create better values.
    // -------------------------------------------------------------------------
    // by default there is only one lightness value
    let lValues = [0.65]
    if(labelCnt > 9){
        lValues = [0.55, 0.8]
    }
    // by default there is only one saturation value ()
    let sValues = [1.0]
    if(labelCnt > 18){
        sValues = [1.0, 0.7]
        if(labelCnt > 36){
            sValues = [1.0, 0.7, 0.4]
        }
    }

    // 3. CREATE COLORS
    // -------------------------------------------------------------------------
    let colors = []
    lValues.forEach(L => {
        sValues.forEach(S => {
            hValues.forEach(H => {
                colors.push({ H, S, L })
            })
        })
    })
    return colors
}


// HELPERS
function toHsl(color: any){
    let {R,G,B} = color
    // 1. convert range from 0-255 to 0-1 (percentual view)
    R /= 255
    G /= 255
    B /= 255

    // 2. find minimum and maximum to calculate luminance
    let min = Math.min(R,G,B)
    let max = Math.max(R,G,B)

    // 3. calculate luminance (average of min and max)
    let L = (min + max) / 2

    // 4. determine saturation. if min == max there is no saturation, just grey. Hue = 0°
    if(min == max){
        return { H: 0, S: 0, L}
    }
    let S = (L < 0.5)
    ? (max - min) / (max + min)
    : Math.abs((max - min) / (2 - max - min))

    // 5. calculate hue
    let H = undefined
    switch(max){
        case R:
        H = (G - B) / (max - min)
        break
        case G:
        H = 2 + (B - R) / (max - min)
        break
        case B:
        H = 4 + (R - G) / (max - min)
        break
    }
    H *= 60
    if(H < 0){
        H += 360
    }
    return { H: Math.round(H), S, L, toString: toHslaString }
}
export function toRgbaString(color: rgbColor, opacity: Number){
    let {R,G,B} = color
    if(opacity === undefined){
        opacity = 1
    }
    return `rgba(${R}, ${G}, ${B}, ${opacity})`
}
export function toHslaString(color: hslColor, opacity: Number){
    let {H,S,L} = color

    if(opacity === undefined){
        opacity = 1
    }
    return `hsla(${H}, ${S*100}%, ${L*100}%, ${opacity})`
}
