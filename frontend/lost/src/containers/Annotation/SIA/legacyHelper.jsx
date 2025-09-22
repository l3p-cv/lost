// @TODO convert old API/backend style to new SIA format

import { AnnotationStatus, AnnotationTool } from 'lost-sia/models'

// while this is not finished, we'll convert the API response here
const convertAnnoToolType = (annotationTypeString) => {
    switch (annotationTypeString) {
        case 'bBoxes':
            return AnnotationTool.BBox
        case 'lines':
            return AnnotationTool.Line
        case 'points':
            return AnnotationTool.Point
        case 'polygons':
            return AnnotationTool.Polygon
    }
}

const unconvertAnnoToolType = (annotationType) => {
    switch (annotationType) {
        case AnnotationTool.BBox:
            return 'bBox'
        case AnnotationTool.Line:
            return 'line'
        case AnnotationTool.Point:
            return 'point'
        case AnnotationTool.Polygon:
            return 'polygon'
    }
}

const unconvertAnnotationStatus = (annotationStatus) => {
    switch (annotationStatus) {
        case AnnotationStatus.CREATING:
            return 'new'
        case AnnotationStatus.DELETED:
            return 'deleted'
        case AnnotationStatus.DATABASE:
        case AnnotationStatus.CREATED:
            return 'database'
        case AnnotationStatus.CHANGED:
            return 'changed'
    }
}

// convert an annotation from SIA into the older Database format
const convertAnnoToOldFormat = (annotation) => {
    // copy without reference
    const annotationInOldFormat = { ...annotation }

    // rename external id
    annotationInOldFormat.id = annotationInOldFormat.externalId
    annotationInOldFormat.externalId = null

    // default (just rename coordinates key)
    annotationInOldFormat.data = annotation.coordinates

    // handle special annotation types that were used in the old format
    if (annotation.type === AnnotationTool.BBox) {
        // get top left point + height and width instead of just two points
        const topLeft = annotationInOldFormat.coordinates[0]
        const downRight = annotationInOldFormat.coordinates[1]

        const width = downRight.x - topLeft.x
        const height = downRight.y - topLeft.y

        const bboxCenter = {
            x: topLeft.x + width / 2,
            y: topLeft.y + height / 2,
        }

        // the old format stored the BBox CENTER, not the top left corner
        const oldFormat = {
            x: bboxCenter.x,
            y: bboxCenter.y,
            w: width,
            h: height,
        }

        annotationInOldFormat.data = oldFormat
    }

    if (annotation.type === AnnotationTool.Point) {
        // list -> single point
        annotationInOldFormat.data = annotation.coordinates[0]
    }

    // finish renaming
    annotationInOldFormat.coordinates = null

    // change the type value back
    annotationInOldFormat.type = unconvertAnnoToolType(annotation.type)

    // change the status value back
    annotationInOldFormat.status = unconvertAnnotationStatus(annotation.status)

    return annotationInOldFormat
}

export default {
    convertAnnoToolType,
    convertAnnoToOldFormat,
    unconvertAnnoToolType,
    unconvertAnnotationStatus,
}
