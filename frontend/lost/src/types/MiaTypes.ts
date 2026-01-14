// export type ImageFilter = {
//   name: string
//   configuration: Map<string, number>
// }

import { Dispatch, SetStateAction } from 'react'

export type MiaImageRequest = {
  imageId: number
  addContext: number
  drawAnno: boolean // TODO: validate
  type: string // TODO: validate
}

export type StateManager<T> = {
  value: T
  set: Dispatch<SetStateAction<T>>
}

export type UpdateMiaPayload = {
  images: any[]
  labels: any[]
}

export type GoBackPayload = {
  maxAmount: number
  currentAmount: number
  firstId: number
}

// export type AnnotationCoordinates = Point | Point[]
