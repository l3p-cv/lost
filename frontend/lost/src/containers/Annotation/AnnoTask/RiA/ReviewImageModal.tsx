import { CSSProperties, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CAlert , CCloseButton} from '@coreui/react'
import { faRotateRight, faArrowRight, faArrowLeft} from '@fortawesome/free-solid-svg-icons'
import BaseModal from '../../../../components/BaseModal'
import CenteredSpinner from '../../../../components/CenteredSpinner'
import CoreIconButton from '../../../../components/CoreIconButton'
import siaApi, { ReviewData, useReview } from '../../../../api/dataset/dataset_review'
import SiaWrapper from '../../SIA/SiaWrapper'
import { showInfo } from '../../../../components/Notification'

type ReviewImageModalProps = {
  annotaskId?: number
  datasetId?: number
  imageId: number
  imageIds: number[]
  onNavigate: (imageId: number) => void
  onClose: () => void
}

const ReviewImageModal = ({ annotaskId, datasetId, imageId, imageIds, onNavigate, onClose }: ReviewImageModalProps) => {
  const { t } = useTranslation()

  const isDatasetMode = datasetId !== undefined
  const taskId = (isDatasetMode ? datasetId : annotaskId) ?? -1

  const annotationRequestData: ReviewData = {
    isAnnotaskReview: !isDatasetMode,
    taskId,
    data: {
      direction: 'current',
      imageAnnoId: imageId,
      iteration: null,
    },
  }

  const {
    data: annoData,
    isError: isReviewError,
    refetch: refetchReview,
  } = useReview(annotationRequestData)

  // dataset scope: the review response carries the annotask the image belongs to
  // (snake_case key, typed on SiaDatasetResponse — no backend change needed)
  const resolvedAnnoTaskId = isDatasetMode
    ? (annoData?.current_annotask_idx ?? -1)
    : (annotaskId ?? -1)

  const index = imageIds.indexOf(imageId)
  const hasPrev = index > 0
  const hasNext = index >= 0 && index < imageIds.length - 1

  const goPrev = () => {
    if (!hasPrev) return
    onNavigate(imageIds[index - 1])
  }

  const goNext = () => {
    if (!hasNext) {
      showInfo('End of annotated images.')
      return
    }
    onNavigate(imageIds[index + 1])
  }

  // close on escape — same pattern as the MIA gallery modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [index, imageIds, onNavigate, onClose])

  /**
   * do not use a CContainer here
   * CContainers remove the ability to get the available height of the page using flexbox
   * Instead, get the current flexbox, let the current child grow to its maximum available with and height
   * and set the display to flexbox, so that the next child can also benefit from it
   */
  const forwardFlex: CSSProperties = {
    flex: '1 1 auto',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  }

  const rowFlex: CSSProperties = {
    flex: '1 1 auto',
    minHeight: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
  }

  if (isReviewError) {
    return (
      <BaseModal size="xl" isOpen={true} toggle={onClose} backdropOption="static">
        <CAlert color="danger" className="m-3" style={{ fontSize: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <strong>{t('review.reviewImageFailed')}</strong>
            <CoreIconButton
              icon={faRotateRight}
              toolTip="Retry"
              onClick={() => refetchReview()}
            />
          </div>
        </CAlert>
      </BaseModal>
    )
  }

  return (
    <BaseModal
      size="xl"
      isOpen={true}
      toggle={onClose}
      backdropOption="static"
      style={{ padding: 0 }}
    >
      <div style={{ ...forwardFlex, height: 'calc(100vh - 200px)', position: 'relative' }}>
        {/* close icon — top right */}
        <CCloseButton
          onClick={onClose}
          style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}
        />
        <div style={rowFlex}>
          {/* SiaWrapper always takes full row width — canvas size never changes */}
          <CoreIconButton
            icon={faArrowLeft}
            color='light'
            inverse
            disabled={!hasPrev}
            onClick={goPrev}
            style={{
              position: 'absolute',
              top: '50%',
              left: '8px',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.65)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              opacity: hasPrev ? 1 : 0.2,
              zIndex: 10,
            }}
          />
          <CoreIconButton
            icon={faArrowRight}
            color='light'
            inverse
            disabled={!hasNext}
            onClick={goNext}
            style={{
              position: 'absolute',
              top: '50%',
              right: '8px',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.65)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              opacity: hasNext ? 1 : 0.2,
              zIndex: 10,
            }}
          />
          <div style={forwardFlex}>
            {annoData === undefined ? (
              <CenteredSpinner />
            ) : (
              <SiaWrapper
                annoData={annoData}
                annoTaskId={resolvedAnnoTaskId}
                datasetId={datasetId}
                isDatasetMode={isDatasetMode}
                isImageSearchEnabled={false}
                siaApi={siaApi}
                isReview={true}
                isSingleImageReview={true}
                onSetAnnotationRequestData={() => {}}
                onRefresh={async () => {
                  await refetchReview()
                }}
              />
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  )
}

export default ReviewImageModal