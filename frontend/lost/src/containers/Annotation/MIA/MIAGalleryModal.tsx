import { useEffect } from 'react'
import { TransformWrapper, TransformComponent } from '@pronestor/react-zoom-pan-pinch'
import { CCol, CFormSwitch, CRow } from '@coreui/react'
import {
  faArrowLeft,
  faArrowRight,
  faCheck,
  faTimes,
  faBan,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BaseModal from '../../../components/BaseModal'
import CoreIconButton from '../../../components/CoreIconButton'
import CenteredSpinner from '../../../components/CenteredSpinner'
import { useGetMiaImage } from '../../../api/mia'
import { useGetSiaImageName } from '../../../api/sia'
import { MiaJunkPayload } from '../../../types/MiaTypes'

type MIAGalleryModalProps = {
  images: { id: number; type: string }[]
  openIndex: number | null
  totalCount: number
  imageActiveStates: {
    value: Record<number, boolean>
    set: (id: number, active: boolean) => void
  }
  onNavigate: (direction: 'prev' | 'next') => void
  onClose: () => void
  imageJunkStates: {
    value: Record<number, boolean>
    set: (id: number, junk: boolean) => void
  }
  onJunkImages: (payload: MiaJunkPayload) => void
  isImageBased: boolean
}

const GalleryImage = ({ imageBase, isJunk,}: {
 imageBase: { id: number; type: string }
  isJunk?: boolean
}) => {
  const miaImage = useGetMiaImage({
    addContext: -1,
    imageId: imageBase.id,
    drawAnno: false,
    type: imageBase.type,
  })

  if (miaImage.isLoading) {
    return (
      <div
        style={{
          width: '100%',
          height: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'black',
        }}
      >
        <CenteredSpinner />
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', background: 'black' }}>
      <TransformWrapper>
        <TransformComponent
          wrapperStyle={{ width: '100%' }}
          contentStyle={{ width: '100%' }}
        >
          <img
            style={{
              width: '100%',
              height: '70vh',
              objectFit: 'contain',
              background: 'black',
            }}
            src={miaImage.data}
            alt=""
            className={isJunk ? 'mia-image-junk' : undefined}
          />
        </TransformComponent>
      </TransformWrapper>
      {isJunk && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'white',
            background: 'rgba(0, 0, 0, 0.6)',
            borderRadius: 8,
            padding: '24px 48px',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          <FontAwesomeIcon icon={faBan} size="5x" style={{ marginBottom: 15 }} />
          <h2>Marked as Junk</h2>
        </div>
      )}
    </div>
  )
}

const MIAGalleryModal = ({
  images,
  openIndex,
  totalCount,
  imageActiveStates,
  imageJunkStates,
  onJunkImages,
  isImageBased,
  onNavigate,
  onClose,
}: MIAGalleryModalProps) => {
  const isOpen = openIndex !== null
  const currentImage = openIndex !== null ? images[openIndex] : null
  const hasPrev = openIndex !== null && openIndex > 0
  const hasNext = openIndex !== null && openIndex < totalCount - 1
  const { data: imageName } = useGetSiaImageName(images[openIndex]?.id)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onNavigate('prev')
      if (e.key === 'ArrowRight') onNavigate('next')
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, openIndex, onNavigate, onClose])

  const renderFooter = () => {
    if (!currentImage) return null
    const isActive = imageActiveStates.value[currentImage.id]
    const isJunk = imageJunkStates.value[currentImage.id]
    return (
      <CRow className="w-100 align-items-center">
        <CCol />
        <CCol className="d-flex justify-content-start align-items-center">
          <span style={{ color: '#aaa', fontSize: '0.9rem' }}>
            Image: {imageName?.img_name}
          </span>
        </CCol>
        <CCol>
          <span style={{ color: '#aaa', fontSize: '0.9rem' }}>
            {openIndex + 1} / {totalCount}
          </span>
        </CCol>
        <CCol className="d-flex justify-content-end align-items-center">
          <CFormSwitch
            className="mx-1"
            size="xl"
            checked={isActive}
            onChange={() => imageActiveStates.set(currentImage.id, !isActive)}
          />
          {isActive ? (
            <CoreIconButton
              text=" Included"
              color="success"
              isOutline={false}
              icon={faCheck}
              inverse
              onClick={() => imageActiveStates.set(currentImage.id, false)}
            />
          ) : (
            <CoreIconButton
              text="Excluded"
              color="danger"
              isOutline={false}
              icon={faTimes}
              inverse
              onClick={() => imageActiveStates.set(currentImage.id, true)}
            />
          )}
          {isImageBased && (
            <CoreIconButton
              className="mx-1"
              icon={faBan}
              color="primary"
              isOutline={!isJunk}
              toolTip={isJunk ? 'Unjunk image' : 'Junk image'}
              onClick={() =>
                onJunkImages({
                  images: [{ id: currentImage.id, isJunk: !isJunk }],
                })
              }
            />
          )}
        </CCol>
      </CRow>
    )
  }

  return (
    <BaseModal
      size="xl"
      isOpen={isOpen}
      toggle={onClose}
      footer={renderFooter()}
      style={{ background: 'black', padding: 0 }}
    >
      <div style={{ position: 'relative', background: 'black' }}>
        {/* close icon — top right */}
        <CoreIconButton
          icon={faTimes}
          color="light"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            zIndex: 10,
          }}
        />
        {currentImage && (
          <GalleryImage
            imageBase={currentImage}
            isJunk={imageJunkStates.value[currentImage.id]}
          />
        )}

        <CoreIconButton
          icon={faArrowLeft}
          color="light"
          disabled={!hasPrev}
          onClick={() => onNavigate('prev')}
          style={{
            position: 'absolute',
            top: '50%',
            left: '8px',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.5)',
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
          color="light"
          disabled={!hasNext}
          onClick={() => onNavigate('next')}
          style={{
            position: 'absolute',
            top: '50%',
            right: '8px',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            opacity: hasNext ? 1 : 0.2,
            zIndex: 10,
          }}
        />
      </div>
    </BaseModal>
  )
}

export default MIAGalleryModal
