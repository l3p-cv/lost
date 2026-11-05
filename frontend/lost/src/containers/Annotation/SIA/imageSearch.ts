import { ImageSearchResult } from '../../Datasets/SIAImageSearchModal'
import { SiaImageListItem } from './SiaPreviewSidebar'

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

  if (currentIndex === -1) return { isFirst: true, isLast: true }

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

  if (currentIndex === -1) return { imageId: -1, annotaskId: -1 }

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

// restrict an image sidebar list to the images of an active image search filter
// (numbers and total are recomputed so the strip badges stay consistent)
const restrictImageListToFilter = (
  imageList: SiaImageListItem[],
  filterIds: number[] | null,
): SiaImageListItem[] => {
  const restricted = filterIds
    ? imageList.filter((item) => filterIds.includes(item.imageId))
    : imageList

  return restricted.map((item, index) => ({
    ...item,
    number: index + 1,
    total: restricted.length,
  }))
}

export default {
  getSearchImageId,
  checkFirstLastImage,
  restrictImageListToFilter,
}
