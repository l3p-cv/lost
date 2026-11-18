import React, { useEffect, useState } from 'react'
import ImageLoading from './ImageLoading'
import { faCheck, faTimes, faBan } from '@fortawesome/free-solid-svg-icons'
import { useGetMiaImage } from '../../../api/mia'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
type MIAImageProps = {
  height: number | string
  imageBase: { id: number; type: string }
  imageActiveState: {
    value: boolean
    set: (id: number, active: boolean) => void
  }
  isJunk?: boolean
  onOpenModal: () => void
}

const MIAImage = ({ height, imageBase, imageActiveState, isJunk, onOpenModal }: MIAImageProps) => {
  const [clicks, setClicks] = useState(0)
  const [timer, setTimer] = useState(-1)
  const [classes, setClasses] = useState('')
  const iconStyle = {
    position: 'absolute',
    top: '4px',
    left: '4px',
    fontSize: '1.5rem',
  }
  const imgRequestData = {
    addContext: -1,
    imageId: imageBase.id,
    drawAnno: false,
    type: imageBase.type,
  }

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
      // double click — open gallery modal
      setTimer(clearTimeout(timer))
      setClicks(0)
      onOpenModal()
    }
  }

  return (
    <>
      {!miaImage.isLoading ? (
        <>
          <div style={{ display: 'inline-block', position: 'relative' }}>
            <img
              alt={imageBase.id}
              id={imageBase.id}
              onClick={() => imageClick()}
              src={miaImage.data}
              className={`mia-image ${classes} ${isJunk ? ' mia-image-junk' : ''}`}
              height={height}
              style={{ display: 'block' }}
            />
            {isJunk && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  color: 'white',
                  background: 'rgba(0, 0, 0, 0.55)',
                  borderRadius: 4,
                  padding: '6px 12px',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              >
                <FontAwesomeIcon icon={faBan} />
                <div>Marked as Junk</div>
              </div>
            )}
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
