import { CSSProperties, useRef, useState } from 'react'
import { useGetSiaThumbnail } from '../../../api/sia'
import SiaHoverPreview from './SiaHoverPreview'

export type SiaImageListItem = {
  imageId: number
  number: number
  total: number
}

type PreviewBoxProps = {
  item: SiaImageListItem
  isActive: boolean
  onSelect: (imageId: number) => void
}

const PreviewBox = ({ item, isActive, onSelect }: PreviewBoxProps) => {
  // console.log('PreviewBox item:', item)
  const { data: thumbnail } = useGetSiaThumbnail(item.imageId, true)
  const ref = useRef<HTMLDivElement>(null)
  const [anchorTop, setAnchorTop] = useState<number | null>(null)

  const handleMouseEnter = () => {
    if (ref.current) {
      setAnchorTop(ref.current.getBoundingClientRect().top)
    }
  }

  const handleMouseLeave = () => {
    setAnchorTop(null)
  }

  const containerStyle: CSSProperties = {
    width: 108,
    height: 108,
    flexShrink: 0,
    position: 'relative',
    cursor: 'pointer',
    borderRadius: 4,
    overflow: 'hidden',
    border: isActive ? '2px solid #0d6efd' : '2px solid transparent',
    background: '#2a2a2a',
    boxSizing: 'border-box',
  }

  const imgStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: thumbnail ? 'block' : 'none',
  }

  const placeholderStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    display: thumbnail ? 'none' : 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#555',
    fontSize: 10,
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

  return (
    <>
      <div
        ref={ref}
        style={containerStyle}
        onClick={() => { if (!isActive) onSelect(item.imageId) }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div style={placeholderStyle}>...</div>
        {thumbnail && <img src={thumbnail} alt={`${item.number}`} style={imgStyle} />}
        <div style={badgeStyle}>
          {item.number} / {item.total}
        </div>
      </div>

      {anchorTop !== null && thumbnail && (
        <SiaHoverPreview
          thumbnail={thumbnail}
          number={item.number}
          total={item.total}
          anchorTop={anchorTop}
        />
      )}
    </>
  )
}

type SiaPreviewSidebarProps = {
  imageList: SiaImageListItem[]
  currentImageId: number
  onSelect: (imageId: number) => void
}

const SiaPreviewSidebar = ({ imageList, currentImageId, onSelect }: SiaPreviewSidebarProps) => {
  const sidebarStyle: CSSProperties = {
    width: 120,
    flex: '1 1 auto',
    minHeight: 0,
    overflowY: 'scroll',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    paddingTop: 6,
    paddingBottom: 6,
    background: 'rgba(var(--cui-primary-rgb, 13,110,253), 0.15)',
    boxSizing: 'border-box',
  }

  return (
    <div
      style={sidebarStyle}
      onWheel={(e) => e.stopPropagation()}
    >
      {imageList.map((item) => (
        <PreviewBox
          key={item.imageId}
          item={item}
          isActive={item.imageId === currentImageId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export default SiaPreviewSidebar
