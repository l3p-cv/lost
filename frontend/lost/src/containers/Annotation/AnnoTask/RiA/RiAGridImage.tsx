import { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { faBan } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useGetMiaImage } from '../../../../api/mia'
import type { ReviewImageListItem } from '../../../../api/dataset/dataset_review'
import ImageLoading from '../../MIA/ImageLoading'

type RiAGridImageProps = {
  item: ReviewImageListItem
  height: number
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

const RiAGridImage = ({ item, height, onOpen }: RiAGridImageProps) => {
  const { t } = useTranslation()
  const { data: image, isLoading } = useGetMiaImage({
    imageId: item.imageId,
    addContext: -1,
    drawAnno: false,
    type: 'imageBased',
  })

  if (isLoading) return <ImageLoading />

  return (
    <div
      className={`ria-image ${item.isJunk ? 'ria-image-junk' : ''}`}
      onClick={onOpen}
      title={item.imageName}
    >
      <img src={image} alt={item.imageName} height={height} style={{ display: 'block' }} />
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