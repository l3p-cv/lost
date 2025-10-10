// @TODO convert old API/backend style to new SIA format

import { Annotation, AnnotationStatus, AnnotationTool } from 'lost-sia/models'
import { AnnotationCoordinates, Point } from 'lost-sia'

export type LegacyBboxData = {
    x: number
    y: number
    w: number
    h: number
}

export type LegacyAnnotation = {
    id: number
    annoTime: number
    data: LegacyBboxData
    labelIds: number[]
    mode: AnnotationMode // do we even need this globally? - only really used inside AnnotationComponent
    selectedNode: number
    status: AnnotationStatus
    type: AnnotationTool
    timestamp: DOMHighResTimeStamp
}

export type LegacyAnnotationResponse = {
    bBoxes: LegacyAnnotation[]
    points: LegacyAnnotation[]
    lines: LegacyAnnotation[]
    polygons: LegacyAnnotation[]
}

// while this is not finished, we'll convert the API response here
const convertAnnoToolType = (annotationTypeString: string): AnnotationTool => {
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

const unconvertAnnoToolType = (annotationType: AnnotationTool): string => {
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

    return ''
}

const unconvertAnnotationStatus = (annotationStatus: AnnotationStatus): string => {
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

    return ''
}

// convert an annotation from SIA into the older Database format
const convertAnnoToOldFormat = (annotation: Annotation) => {
    // copy without reference
    const annotationInOldFormat: Annotation = { ...annotation }

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

const convertBboxFormat = (box: LegacyBboxData): Point[] => {
    const centerPoint = { x: box.x, y: box.y }
    const topLeftPoint = {
        x: centerPoint.x - box.w / 2,
        y: centerPoint.y - box.h / 2,
    }
    const bottomRightPoint = {
        x: centerPoint.x + box.w / 2,
        y: centerPoint.y + box.h / 2,
    }

    return [topLeftPoint, bottomRightPoint]
}

const convertAnnoToNewFormat = (
    legacyAnnotation: LegacyAnnotation,
    legacyAnnotationType: string,
): Annotation => {
    const convertedAnnoType = convertAnnoToolType(legacyAnnotationType)

    let newCoords: AnnotationCoordinates = legacyAnnotation.data

    if (convertedAnnoType === AnnotationTool.BBox) {
        // the old format saved the CENTER of the BBox, not the top left corner...
        const centerPoint = { x: newCoords.x, y: newCoords.y }
        const topLeftPoint = {
            x: centerPoint.x - newCoords.w / 2,
            y: centerPoint.y - newCoords.h / 2,
        }
        const bottomRightPoint = {
            x: centerPoint.x + newCoords.w / 2,
            y: centerPoint.y + newCoords.h / 2,
        }

        newCoords = [topLeftPoint, bottomRightPoint]
    }

    if (convertedAnnoType === AnnotationTool.Point) {
        newCoords = [legacyAnnotation.data]
    }

    return {
        ...legacyAnnotation,
        id: null,
        data: null,
        externalId: `${legacyAnnotation.id}`,
        coordinates: newCoords,
        type: convertedAnnoType,
        status: AnnotationStatus.DATABASE,
    }
}

export default {
    convertAnnoToolType,
    convertAnnoToNewFormat,
    convertAnnoToOldFormat,
    convertBboxFormat,
    unconvertAnnoToolType,
    unconvertAnnotationStatus,
}
