import React, { useEffect, useState } from 'react'
import { TransformWrapper, TransformComponent } from '@pronestor/react-zoom-pan-pinch'
import BaseModal from '../../../components/BaseModal'
import ImageLoading from './ImageLoading'
import { CRow, CFormSwitch, CCol } from '@coreui/react'
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
import { useGetMiaImage } from '../../../api/mia'
import CoreIconButton from '../../../components/CoreIconButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
type MIAImageProps = {
  height: number | string
  imageBase: { id: number; type: string }
  imageActiveState: {
    value: boolean
    set: (id: number, active: boolean) => void
  }
}

const MIAImage = ({ height, imageBase, imageActiveState }: MIAImageProps) => {
  const [clicks, setClicks] = useState(0)
  const [timer, setTimer] = useState(-1)
  const [classes, setClasses] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const iconStyle = {
    position: 'absolute',
    top: '4',
    left: '4',
    fontSize: '1.5rem',
  }
  const [imgRequestData, setImgRequestData] = useState({
    addContext: -1,
    imageId: imageBase.id,
    drawAnno: false,
    type: imageBase.type,
  })

  const miaImage = useGetMiaImage(imgRequestData)

  useEffect(() => {
    if (imageActiveState.value) {
      setClasses(classes.replace(' mia-image-inactive', ''))
    } else {
      if (!classes.includes(' mia-image-inactive')) {
        setClasses(`${classes} mia-image-inactive`)
      }
    }
  }, [imageActiveState.value])

  const imageClick = () => {
    let newClicks = clicks + 1
    setClicks(newClicks)
    if (newClicks === 1) {
      setTimer(
        setTimeout(() => {
          // reset.
          setClicks(0)
          if (imageActiveState.value) {
            imageActiveState.set(imageBase.id, false)
          } else {
            imageActiveState.set(imageBase.id, true)
          }
        }, 250),
      )
    } else {
      setTimer(clearTimeout(timer))
      setClicks(0)
      setModalOpen(true)
    }
  }
  const modalFooter = () => {
    return (
      <CRow>
        <CCol className="d-flex align-items-center">
          <CFormSwitch
            className={'mx-1'}
            size="xl"
            checked={imageActiveState.value}
            onChange={() => imageActiveState.set(imageBase.id, !imageActiveState.value)}
          />
          {imageActiveState.value ? (
            <CoreIconButton
              text=" Included"
              color="success"
              isOutline={false}
              icon={faCheck}
              inverse
            />
          ) : (
            <CoreIconButton
              text="Excluded"
              color="danger"
              isOutline={false}
              icon={faTimes}
              inverse
            />
          )}
        </CCol>
      </CRow>
    )
  }

  return (
    <>
      <BaseModal
        size="xl"
        isOpen={modalOpen}
        isShowCancelButton
        toggle={() => setModalOpen(false)}
        footer={modalFooter()}
      >
        <div key={imageBase.id}>
          <CRow className="justify-content-center">
            <TransformWrapper>
              <TransformComponent>
                <img style={{ maxWidth: '100%' }} src={miaImage.data} alt="" />
              </TransformComponent>
            </TransformWrapper>
          </CRow>
        </div>
      </BaseModal>
      {!miaImage.isLoading ? (
        <>
          <div style={{ display: 'inline-block', position: 'relative' }}>
            <img
              alt={imageBase.id}
              id={imageBase.id}
              onClick={() => imageClick()}
              src={miaImage.data}
              className={`mia-image ${classes}`}
              height={height}
              style={{ display: 'block' }}
            />

            {imageActiveState.value ? (
              <FontAwesomeIcon
                style={iconStyle}
                // size={'2x'}
                color={'#0d0'}
                icon={faCheck}
              />
            ) : (
              <FontAwesomeIcon
                style={iconStyle}
                // size={'2x'}
                color={'red'}
                icon={faTimes}
              />
            )}
          </div>
        </>
      ) : (
        <ImageLoading />
      )}
    </>
  )
}

export default MIAImage
