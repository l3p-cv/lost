import React, { useEffect, useState } from 'react'
import { TransformWrapper, TransformComponent } from '@pronestor/react-zoom-pan-pinch'
import BaseModal from '../../../components/BaseModal'
import ImageLoading from './ImageLoading'
import { CRow, CFormSwitch } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
import { useGetMiaImage } from '../../../api/mia'
// import { MiaImageRequest } from '../../../types/MiaTypes'

const MIAImage = ({ height, imageBase, imageActiveState }) => {
  const [clicks, setClicks] = useState(0)
  const [timer, setTimer] = useState(-1) // HACK: undefined
  const [classes, setClasses] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  // const [isActive, setIsActive] = useState(imageBase.is_active ?? true)
  // TODO: restructure isActive -> needed in Control
  // TODO:

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
      <>
        <CFormSwitch
          className={'mx-1'}
          variant={'3d'}
          color={'primary'}
          checked={imageActiveState.value}
          onChange={() => imageActiveState.set(imageBase.id, !imageActiveState.value)}
        />
        <div style={{ marginRight: '50px' }}>
          {imageActiveState.value ? (
            <>
              <FontAwesomeIcon
                className="mr-3"
                size={'1x'}
                color={'green'}
                icon={faCheck}
              />
              &nbsp;
              <b>Included</b>
            </>
          ) : (
            <>
              <FontAwesomeIcon
                className="mr-3"
                size={'1x'}
                color={'red'}
                icon={faTimes}
              />
              &nbsp;
              <b>Excluded</b>
            </>
          )}
        </div>
      </>
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
          <div style={{ display: 'inline', position: 'relative' }}>
            <img
              alt={imageBase.id}
              id={imageBase.id}
              onClick={() => imageClick()}
              src={miaImage.data}
              className={`mia-image ${classes}`}
              height={height}
              style={{ display: 'inline' }}
            />
            {imageActiveState.value ? (
              ''
            ) : (
              <FontAwesomeIcon
                style={{ position: 'absolute', bottom: 0, left: '45%' }}
                className="mr-3"
                size={'2x'}
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
