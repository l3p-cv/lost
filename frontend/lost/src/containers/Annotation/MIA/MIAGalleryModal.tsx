import { useEffect } from 'react'
import { TransformWrapper, TransformComponent } from '@pronestor/react-zoom-pan-pinch'
import { CCol, CFormSwitch, CRow } from '@coreui/react'
import { faArrowLeft, faArrowRight, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
import BaseModal from '../../../components/BaseModal'
import CoreIconButton from '../../../components/CoreIconButton'
import CenteredSpinner from '../../../components/CenteredSpinner'
import { useGetMiaImage } from '../../../api/mia'

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
}

const GalleryImage = ({ imageBase }: { imageBase: { id: number; type: string } }) => {
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
    <TransformWrapper>
      <TransformComponent wrapperStyle={{ width: '100%' }} contentStyle={{ width: '100%' }}>
        <img
          style={{ width: '100%', height: '70vh', objectFit: 'contain', background: 'black' }}
          src={miaImage.data}
          alt=""
        />
      </TransformComponent>
    </TransformWrapper>
  )
}

const MIAGalleryModal = ({
  images,
  openIndex,
  totalCount,
  imageActiveStates,
  onNavigate,
  onClose,
}: MIAGalleryModalProps) => {
  const isOpen = openIndex !== null
  const currentImage = openIndex !== null ? images[openIndex] : null
  const hasPrev = openIndex !== null && openIndex > 0
  const hasNext = openIndex !== null && openIndex < totalCount - 1

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
    return (
      <CRow className="w-100 align-items-center">
        <CCol />
        <CCol className="d-flex justify-content-center align-items-center">
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
        {currentImage && <GalleryImage imageBase={currentImage} />}

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
