import { CSSProperties, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { faBan } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useGetMiaImage } from '../../../../api/mia'
import type { ReviewImageListItem } from '../../../../api/dataset/dataset_review'
import ImageLoading from '../../MIA/ImageLoading'

type RiAGridImageProps = {
  item: ReviewImageListItem
  height: number
  showAnnos: boolean
  isActive?: boolean
  onOpen: () => void
}

const badgeStyle: CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  textAlign: 'center',
  fontSize: 10,
  color: 'white',
  background: 'rgba(0,0,0,0.55)',
  padding: '2px 0',
  pointerEvents: 'none',
}

const RiAGridImage = ({ item, height, showAnnos, isActive, onOpen }: RiAGridImageProps) => {
  const cellRef = useRef<HTMLDivElement>(null)
  const scrolledForActive = useRef(false)
  const { t } = useTranslation()
  const { data: image, isLoading } = useGetMiaImage({
    imageId: item.imageId,
    addContext: -1,
    drawAnno: showAnnos,
    type: 'imageBased',
  })

  useEffect(() => {
    if (!isActive) {
      scrolledForActive.current = false
      return
    }
    if (isLoading || scrolledForActive.current) return
    scrolledForActive.current = true
    cellRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [isActive, isLoading])

  if (isLoading) return <ImageLoading />

  return (
    <div
      ref={cellRef}
      className={`ria-image ${isActive ? 'ria-image-active' : ''}`}
      onClick={onOpen}
      title={item.imageName}
    >
      <img src={image} alt={item.imageName} height={height} className={item.isJunk ? 'ria-image-junk' : undefined} style={{ display: 'block' }} />
      {item.isJunk && (
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
          <div>{t('review.markedAsJunk')}</div>
        </div>
      )}
      <div style={badgeStyle}>
        {item.number} / {item.total}
      </div>
    </div>
  )
}

export default RiAGridImage