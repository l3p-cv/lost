import { ImageSearchResult } from '../../Datasets/SIAImageSearchModal'

export type FirstLastResult = {
  isFirst: boolean
  isLast: boolean
}

const checkFirstLastImage = (
  currentId: number,
  filteredImageIds: ImageSearchResult[],
): FirstLastResult => {
  // get position in list to determine if its the first or last entry
  const currentIndex: number = filteredImageIds.findIndex(
    (result: ImageSearchResult) => result.imageId === currentId,
  )

  return {
    isFirst: currentIndex === 0,
    isLast: currentIndex === filteredImageIds.length - 1,
  }
}

const getSearchImageId = (
  currentId: number,
  isDirectionNext: boolean,
  filteredImageIds: ImageSearchResult[],
): ImageSearchResult => {
  // get position in list to determine if its the first or last entry
  const currentIndex: number = filteredImageIds.findIndex(
    (result: ImageSearchResult) => result.imageId === currentId,
  )

  // next image
  if (isDirectionNext) {
    // catch last image
    if (currentIndex === filteredImageIds.length - 1)
      return { imageId: -1, annotaskId: -1 }

    return filteredImageIds[currentIndex + 1]
  }

  // previous image
  // catch first image
  if (currentIndex === 0) return { imageId: -1, annotaskId: -1 }

  return filteredImageIds[currentIndex - 1]
}

export default {
  getSearchImageId,
  checkFirstLastImage,
}
