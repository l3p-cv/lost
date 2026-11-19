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
import siaApi, { useGetReviewImageList } from '../../../../api/dataset/dataset_review'
import imageSearch from '../../SIA/imageSearch'
import SIAImageSearchModal from '../../../Datasets/SIAImageSearchModal'
import RiAGridImage from './RiAGridImage'
import ReviewImageModal from './ReviewImageModal'
import './RiA.scss'

const MIN_ZOOM = 20
const MAX_ZOOM = 1920

type ReviewRiAProps = {
  annotaskId: number
  // view-mode switch (Image|Grid) injected by review page
  viewSwitch?: ReactNode
}

const ReviewRiA = ({ annotaskId, viewSwitch }: ReviewRiAProps) => {
  const { t } = useTranslation()
  const [zoom, setZoom] = useState(200)
  // image ids of an active image search — restricts the grid to the filtered images
  const [filterIds, setFilterIds] = useState<number[] | null>(null)
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false)
  const [openImageId, setOpenImageId] = useState<number | null>(null)

  const { data: imageList, isLoading, refetch: refetchImageList } =
    useGetReviewImageList(annotaskId)
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
        isAnnotaskReview={true}
        id={annotaskId}
        isVisible={isSearchModalVisible}
        setIsVisible={setIsSearchModalVisible}
        possibleAnnotaskLabels={possibleLabels}
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
          annotaskId={annotaskId}
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
      <div className="ria-images" ref={gridRef}>
        {filtered.map((item) => (
          <RiAGridImage
            key={item.imageId}
            item={item}
            height={zoom}
            onOpen={() => setOpenImageId(item.imageId)}
          />
        ))}
      </div>
    </>
  )
}

export default ReviewRiA