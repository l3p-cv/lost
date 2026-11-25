import { ReactNode, useEffect, useReducer, useRef, useState } from 'react'
import { useQueryClient } from 'react-query'
import { useTranslation } from 'react-i18next'
import { CAlert, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import {
  faEye,
  faEyeSlash,
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
import RiAPagination from './RiAPagination'
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

export type RiAPreference<T> = {
  value: T
  // accepts functional updaters so the grid keeps its setZoom((z) => …) style unchanged
  set: (value: T | ((prev: T) => T)) => void
}

type ReviewRiAProps = {
  annotaskId?: number
  datasetId?: number
  // view-mode switch (Image|Grid) injected by review page
  viewSwitch?: ReactNode
  // switch back to same image (grid -> single image review)
  onActiveImageChange?: (imageId: number) => void
  // current image that's being viewed
  activeImageId?: number
  zoomState: RiAPreference<number>
  pageSizeState: RiAPreference<number>
  showAnnosState: RiAPreference<boolean>
}

const ReviewRiA = ({ annotaskId, datasetId, viewSwitch, onActiveImageChange, activeImageId, zoomState, pageSizeState, showAnnosState}: ReviewRiAProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  // preferences come from the review page (survive toggling) — aliases keep every call site unchanged
  const { value: zoom, set: setZoom } = zoomState
  const { value: pageSize, set: setPageSize } = pageSizeState
  const { value: showAnnos, set: setShowAnnos } = showAnnosState
  // image ids of an active image search — restricts the grid to the filtered images
  const [filterIds, setFilterIds] = useState<number[] | null>(null)
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false)
  const [openImageId, setOpenImageId] = useState<number | null>(null)
  const openImage = (id: number) => {
    setOpenImageId(id)
    onActiveImageChange?.(id)
  }
  // draw all 2D annos on the grid thumbnails (default on — review is about seeing what was drawn)
  const [page, setPage] = useState(0)

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

  // ctrl+wheel zoom — window-level so the listener can never miss its attach,
  // but only applied while the cursor is over the grid and never with the modal open
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return // plain wheel keeps scrolling the page
      if (openImageId !== null) return // modal open — the modal canvas owns the wheel
      const el = gridRef.current
      if (!el || !el.contains(e.target as Node)) return // outside the grid — browser keeps its zoom
      e.preventDefault()
      setZoom((z) => {
        const factor = e.deltaY < 0 ? 1.1 : 0.9
        return Math.min(Math.max(z * factor, MIN_ZOOM), MAX_ZOOM)
      })
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [openImageId])

  const filtered = imageSearch.restrictImageListToFilter(imageList ?? [], filterIds)
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, pageCount - 1)
  const paged = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize)

  // page-sync — jump to the page containing the reviewed image.
  // deps are deliberately [activeImageId] only so manual paging and Amount changes are never fought
  useEffect(() => {
    if (activeImageId == null) return
    const idx = filtered.findIndex((item) => item.imageId === activeImageId)
    if (idx >= 0) setPage(Math.floor(idx / pageSize))
  }, [activeImageId])

  const renderCell = (item: ReviewImageListItem) => (
    <RiAGridImage
      key={item.imageId}
      item={item}
      height={zoom}
      showAnnos={showAnnos}
      isActive={item.imageId === activeImageId}
      onOpen={() => openImage(item.imageId)}
    />
  )

  const closeModal = () => {
    setOpenImageId(null)
    // refresh junk/label state shown in the grid
    void refetchImageList()
    queryClient.invalidateQueries(['miaimage']) // thumbnail queries marked invalid
    queryClient.invalidateQueries(['getsiareviewannos']) // active review refetches
  }

  const editRefreshTimer = useRef<number | undefined>(undefined)

  const handleModalEdit = () => {
      window.clearTimeout(editRefreshTimer.current)
      editRefreshTimer.current = window.setTimeout(() => {
        if (openImageId === null) return
        queryClient.invalidateQueries(['miaimage', {
          imageId: openImageId,
          addContext: -1,
          drawAnno: showAnnos,
          type: 'imageBased',
        }])
        void refetchImageList()
      }, 500)
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
          openImage(imageId)
        }}
        onSearchResult={(results) => {
          setFilterIds(results.map((result) => result.imageId))
          setPage(0)
        }}
        currentImageId={-1}
      />
      {openImageId !== null && (
        <ReviewImageModal
          annotaskId={isDatasetMode ? undefined : annotaskId}
          datasetId={datasetId}
          imageId={openImageId}
          imageIds={filtered.map((item) => item.imageId)}
          onNavigate={(id) => { 
            openImage(id)
            const idx = filtered.findIndex((item) => item.imageId === id)
            if (idx >= 0) setPage(Math.floor(idx / pageSize))
            }
          }
          onAnnoDataChanged={handleModalEdit}
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
            onClick={() => {
              setFilterIds(null)
              setPage(0)
            }}
          />
        )}
        <CoreIconButton
          icon={showAnnos ? faEye : faEyeSlash}
          color={showAnnos ? 'primary' : 'secondary'}
          isOutline={!showAnnos}
          toolTip={showAnnos ? t('review.hideAnnos') : t('review.showAnnos')}
          onClick={() => setShowAnnos((s) => !s)}
        />
        <span className="ria-toolbar-count">
          {t('review.showingRanged', {
              from: safePage * pageSize + 1,
              to: safePage * pageSize + paged.length,
              total: filtered.length,
           })}
        </span>
        <CoreIconButton icon={faSearchMinus} toolTip={t('review.zoomOut')} onClick={zoomOut} />
        <CoreIconButton icon={faSearchPlus} toolTip={t('review.zoomIn')} onClick={zoomIn} />
        <CDropdown>
          <CDropdownToggle color='primary' variant='outline' caret>Amount</CDropdownToggle>
          <CDropdownMenu>
            {[1,5,10,20,50,100,150,200].map((n) => (
              <CDropdownItem key={n} onClick={() => {setPageSize(n); setPage(0) }}>{n}</CDropdownItem>
            ))}
          </CDropdownMenu>
        </CDropdown>
        {viewSwitch}
      </div>
      <div ref={gridRef}>
        {isDatasetMode ? (
          groupByAnnotask(paged).map((group) => (
            <div className="ria-section" key={group.annotaskId}>
              <div className="ria-section-header">
                {group.annotaskName} <span>({group.items.length})</span>
              </div>
              <div className="ria-images">{group.items.map(renderCell)}</div>
            </div>
          ))
        ) : (
          <div className="ria-images">{paged.map(renderCell)}</div>
        )}
      </div>
      <RiAPagination page={safePage} pageCount={pageCount} onChange={setPage} />
    </>
  )
}

export default ReviewRiA