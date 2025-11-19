// @TODO convert old API/backend style to new SIA format

import {
  Annotation,
  AnnotationMode,
  AnnotationStatus,
  AnnotationTool,
} from 'lost-sia/models'
import type { ExternalAnnotation, Point } from 'lost-sia'

export type LegacyBboxData = {
  x: number
  y: number
  w: number
  h: number
}

export type AnnotationCoordinates = LegacyBboxData | Point | Point[]

// legacy annotation but some parameters are optional for converting it into an annotation
type ConvertingAnnotation = {
  id?: string
  annoTime: number
  data?: AnnotationCoordinates
  labelIds?: number[]
  mode: AnnotationMode // do we even need this globally? - only really used inside AnnotationComponent
  selectedNode: number
  status: string | AnnotationStatus
  type: string | AnnotationTool
  timestamp?: DOMHighResTimeStamp
}

export type LegacyAnnotation = {
  id: string
  annoTime: number
  data: AnnotationCoordinates
  labelIds?: number[]
  mode: AnnotationMode // do we even need this globally? - only really used inside AnnotationComponent
  selectedNode: number
  status: string
  type: string
  timestamp?: DOMHighResTimeStamp
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

  // just to satisfy linter. This should never be actually called
  return AnnotationTool.Point
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
}

const unconvertAnnotationStatus = (annotationStatus: AnnotationStatus): string => {
  switch (annotationStatus) {
    case AnnotationStatus.CREATING:
      return 'new'
    case AnnotationStatus.DELETED:
      return 'deleted'
    case AnnotationStatus.LOADED:
    case AnnotationStatus.CREATED:
      return 'database'
    case AnnotationStatus.CHANGED:
      return 'changed'
  }
}

// convert an annotation from SIA into the older Database format
const convertAnnoToOldFormat = (annotation: Annotation): LegacyAnnotation => {
  // remove the coordinates and externalId attributes without modifying the original object
  const tmpAnnotation = { ...annotation, coordinates: null, externalId: null }

  // copy without reference
  const annotationInOldFormat: LegacyAnnotation = {
    ...tmpAnnotation,
    id: `${annotation.externalId}`, // rename external id
    data: annotation.coordinates, // default (just rename coordinates key)
    status: '', // satisfy typescript linter (will be replaced later)
    type: '', // satisfy typescript linter (will be replaced later)
  }

  // handle special annotation types that were used in the old format
  if (annotation.type === AnnotationTool.BBox) {
    // get top left point + height and width instead of just two points
    const topLeft = annotation.coordinates[0]
    const downRight = annotation.coordinates[1]

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
): ExternalAnnotation => {
  const convertedAnnoType = convertAnnoToolType(legacyAnnotationType)

  let newCoords: Point[]

  switch (convertedAnnoType) {
    case AnnotationTool.BBox:
      newCoords = convertBboxFormat(legacyAnnotation.data as LegacyBboxData)
      break

    case AnnotationTool.Point:
      newCoords = [legacyAnnotation.data as Point]
      break
    default:
      newCoords = legacyAnnotation.data as Point[]
  }

  const convertingAnnotation: ConvertingAnnotation = { ...legacyAnnotation }
  delete convertingAnnotation.id
  delete convertingAnnotation.data

  const newAnnotation: ExternalAnnotation = {
    ...convertingAnnotation,
    externalId: `${legacyAnnotation.id}`,
    coordinates: newCoords,
    type: convertedAnnoType,
    status: AnnotationStatus.LOADED,
    labelIds: legacyAnnotation.labelIds ? legacyAnnotation.labelIds : [],
  }

  return newAnnotation
}

export default {
  convertAnnoToolType,
  convertAnnoToNewFormat,
  convertAnnoToOldFormat,
  convertBboxFormat,
  unconvertAnnoToolType,
  unconvertAnnotationStatus,
}
