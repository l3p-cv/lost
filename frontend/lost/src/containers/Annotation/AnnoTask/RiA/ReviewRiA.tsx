import { ReactNode, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CAlert } from '@coreui/react'
import {
  faMagnifyingGlassMinus,
  faRotateRight,
  faSearch,
  faSearchMinus,
  faSearchPlus,
} from '@fortawesome/free-solid-svg-icons'
import CenteredSpinner from '../../../../components/CenteredSpinner'
import CoreIconButton from '../../../../components/CoreIconButton'
import siaApi, { DatasetReviewImageListItem, ReviewImageListItem, useGetDatasetReviewImageList, useGetReviewImageList } from '../../../../api/dataset/dataset_review'
import imageSearch from '../../SIA/imageSearch'
import SIAImageSearchModal from '../../../Datasets/SIAImageSearchModal'
import RiAGridImage from './RiAGridImage'
import ReviewImageModal from './ReviewImageModal'
import './RiA.scss'

const MIN_ZOOM = 20
const MAX_ZOOM = 1920

// group a dataset-scoped image list per annotask — insertion order keeps the backend's annotask order
const groupByAnnotask = (items: DatasetReviewImageListItem[]) => {
  const groups = new Map<
    number,
    {
      annotaskId: number
      annotaskName: string
      items: DatasetReviewImageListItem[]
    }
  >()
  for (const item of items) {
    const group = groups.get(item.annotaskId)
    if (group) group.items.push(item)
    else
      groups.set(item.annotaskId, {
        annotaskId: item.annotaskId,
        annotaskName: item.annotaskName,
        items: [item],
      })
  }
  return [...groups.values()]
}

type ReviewRiAProps = {
  annotaskId?: number
  datasetId?: number
  // view-mode switch (Image|Grid) injected by review page
  viewSwitch?: ReactNode
}

const ReviewRiA = ({ annotaskId, datasetId, viewSwitch }: ReviewRiAProps) => {
  const { t } = useTranslation()
  const [zoom, setZoom] = useState(200)
  // image ids of an active image search — restricts the grid to the filtered images
  const [filterIds, setFilterIds] = useState<number[] | null>(null)
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false)
  const [openImageId, setOpenImageId] = useState<number | null>(null)

  const isDatasetMode = datasetId !== undefined

  const {data: annotaskImageList,isLoading: annotaskIsLoading,refetch: refetchAnnotaskList,} = useGetReviewImageList(annotaskId)

  const {data: datasetImageList,isLoading: datasetIsLoading,refetch: refetchDatasetList,} = useGetDatasetReviewImageList(datasetId)

  const imageList = (
    isDatasetMode ? datasetImageList : annotaskImageList
  ) as DatasetReviewImageListItem[] | undefined // superset — sections code reads annotask fields only in dataset scope
  const isLoading = isDatasetMode ? datasetIsLoading : annotaskIsLoading
  const refetchImageList = isDatasetMode ? refetchDatasetList : refetchAnnotaskList

  const { data: possibleLabels } = siaApi.useGetPossibleLabels(annotaskId)

  const zoomIn = () => setZoom((z) => Math.min(z * 1.2, MAX_ZOOM))
  const zoomOut = () => setZoom((z) => Math.max(z * 0.8, MIN_ZOOM))
  const gridRef = useRef<HTMLDivElement>(null)

  // ctrl+wheel over the grid 
  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return // plain wheel keeps scrolling the page
      e.preventDefault()
      setZoom((z) => {
        const factor = e.deltaY < 0 ? 1.1 : 0.9
        return Math.min(Math.max(z * factor, MIN_ZOOM), MAX_ZOOM)
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [imageList?.length])

  const filtered = imageSearch.restrictImageListToFilter(imageList ?? [], filterIds)

  const renderCell = (item: ReviewImageListItem) => (
    <RiAGridImage
      key={item.imageId}
      item={item}
      height={zoom}
      onOpen={() => setOpenImageId(item.imageId)}
    />
  )

  const closeModal = () => {
    setOpenImageId(null)
    // refresh junk/label state shown in the grid
    void refetchImageList()
  }

  if (isLoading) return <CenteredSpinner />

  if (!imageList || imageList.length === 0) {
    return (
      <CAlert color="warning" className="m-3" style={{ fontSize: '1.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <strong>{t('review.noAnnotatedImages')}</strong>
          <CoreIconButton
            icon={faRotateRight}
            toolTip={t('review.checkForNewAnnotations')}
            onClick={() => void refetchImageList()}
          />
        </div>
      </CAlert>
    )
  }

  return (
    <>
      <SIAImageSearchModal
        isAnnotaskReview={!isDatasetMode}
        id={annotaskId ?? datasetId ?? -1}
        isVisible={isSearchModalVisible}
        setIsVisible={setIsSearchModalVisible}
        possibleAnnotaskLabels={isDatasetMode ? [] : possibleLabels}
        onChooseImage={(imageId) => {
          setIsSearchModalVisible(false)
          setOpenImageId(imageId)
        }}
        onSearchResult={(results) =>
          setFilterIds(results.map((result) => result.imageId))
        }
        currentImageId={-1}
      />
      {openImageId !== null && (
        <ReviewImageModal
          annotaskId={isDatasetMode ? undefined : annotaskId}
          datasetId={datasetId}
          imageId={openImageId}
          onClose={closeModal}
        />
      )}
      <div className="ria-toolbar">
        <CoreIconButton
          icon={faSearch}
          toolTip={t('review.imageSearch')}
          onClick={() => setIsSearchModalVisible(true)}
        />
        {filterIds && (
          <CoreIconButton
            icon={faMagnifyingGlassMinus}
            color="danger"
            isOutline={false}
            toolTip={t('review.clearFilter')}
            onClick={() => setFilterIds(null)}
          />
        )}
        <span className="ria-toolbar-count">
          {t('review.showing', { shown: filtered.length, total: imageList.length })}
        </span>
        <CoreIconButton icon={faSearchMinus} toolTip={t('review.zoomOut')} onClick={zoomOut} />
        <CoreIconButton icon={faSearchPlus} toolTip={t('review.zoomIn')} onClick={zoomIn} />
        {viewSwitch}
      </div>
      <div ref={gridRef}>
        {isDatasetMode ? (
          groupByAnnotask(filtered).map((group) => (
            <div className="ria-section" key={group.annotaskId}>
              <div className="ria-section-header">
                {group.annotaskName} <span>({group.items.length})</span>
              </div>
              <div className="ria-images">{group.items.map(renderCell)}</div>
            </div>
          ))
        ) : (
          <div className="ria-images">{filtered.map(renderCell)}</div>
        )}
      </div>
    </>
  )
}

export default ReviewRiA