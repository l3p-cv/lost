// export type ImageFilter = {
//   name: string
//   configuration: Map<string, number>
// }

import { Dispatch, SetStateAction } from 'react'

export type MiaImageRequest = {
  imageId: number
  addContext: number
  drawAnno: boolean
  type: string
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
  currentChunkId: number
  currentUpdateIds: number[]
  maxAmount: number
}

export type MiaAnnosResponse = {
  proposedLabel?: string
  chunk: {
    id: number
    hasPrev: boolean
  }
  updateIds: number[]
  images: MiaImage[]
}

export type MiaImage = {
  id: number
  type: 'imageBased' | 'twodBased'
  imgActions: []
  updateId: number
}
