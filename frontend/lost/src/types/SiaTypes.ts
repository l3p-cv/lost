import { Point } from 'lost-sia'

export type ImageFilter = {
    name: string
    configuration: Map<string, number>
}

export type SiaImageRequest = {
    imageId: number
    appliedFilters: ImageFilter[]
}

// used to valiate coordinates of the various annotation tools/formats
export type AnnotationCoordinates = Point | Point[]
