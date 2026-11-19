import { CSSProperties, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CAlert , CCloseButton} from '@coreui/react'
import { faRotateRight, faTimes } from '@fortawesome/free-solid-svg-icons'
import BaseModal from '../../../../components/BaseModal'
import CenteredSpinner from '../../../../components/CenteredSpinner'
import CoreIconButton from '../../../../components/CoreIconButton'
import siaApi, { ReviewData, useReview } from '../../../../api/dataset/dataset_review'
import SiaWrapper from '../../SIA/SiaWrapper'

type ReviewImageModalProps = {
  annotaskId: number
  imageId: number
  onClose: () => void
}

const ReviewImageModal = ({ annotaskId, imageId, onClose }: ReviewImageModalProps) => {
  const { t } = useTranslation()

  const annotationRequestData: ReviewData = {
    isAnnotaskReview: true,
    taskId: annotaskId,
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

  // close on escape — same pattern as the MIA gallery modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

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
          <div style={forwardFlex}>
            {annoData === undefined ? (
              <CenteredSpinner />
            ) : (
              <SiaWrapper
                annoData={annoData}
                annoTaskId={annotaskId}
                isDatasetMode={false}
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