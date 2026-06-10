import { CSSProperties } from 'react'
import ReactDOM from 'react-dom'

const POPOVER_SIZE = 300
const SIDEBAR_WIDTH = 120
const POPOVER_GAP = 6

type SiaHoverPreviewProps = {
  thumbnail: string
  number: number
  total: number
  anchorTop: number
}

const SiaHoverPreview = ({ thumbnail, number, total, anchorTop }: SiaHoverPreviewProps) => {
  const top = Math.max(8, Math.min(anchorTop, window.innerHeight - POPOVER_SIZE - 8))

  const popoverStyle: CSSProperties = {
    position: 'fixed',
    left: SIDEBAR_WIDTH + POPOVER_GAP,
    top,
    width: POPOVER_SIZE,
    height: POPOVER_SIZE,
    borderRadius: 6,
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
    zIndex: 9999,
    background: '#1e1e1e',
    display: 'flex',
    flexDirection: 'column',
    pointerEvents: 'none',
  }

  const imgStyle: CSSProperties = {
    width: '100%',
    flex: '1 1 auto',
    objectFit: 'cover',
    display: 'block',
  }

  const labelStyle: CSSProperties = {
    textAlign: 'center',
    fontSize: 12,
    color: '#ccc',
    padding: '4px 0',
    background: '#1e1e1e',
    flexShrink: 0,
  }

  return ReactDOM.createPortal(
    <div style={popoverStyle}>
      <img src={thumbnail} alt={`preview ${number}`} style={imgStyle} />
      <div style={labelStyle}>
        {number} / {total}
      </div>
    </div>,
    document.body,
  )
}

export default SiaHoverPreview
