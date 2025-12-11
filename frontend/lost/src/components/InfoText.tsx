import { CCol, CRow, CTooltip } from '@coreui/react'
import { CSSProperties } from 'react'

type InfoTextProps = {
  text?: string
  subText?: string | null
  style?: CSSProperties
  className?: string
  toolTip?: string
  tTipPlacement?: 'top' | 'left' | 'right' | 'auto' | 'bottom' | undefined
  id?: string | undefined
}

const InfoText = ({
  text = '',
  subText = null,
  style = {},
  className = '',
  toolTip = '',
  tTipPlacement = 'top',
  id = undefined,
}: InfoTextProps) => {
  return (
    <div id={id} className={className} style={style}>
      <CRow>
        <CTooltip content={toolTip} placement={tTipPlacement}>
          <b style={{ textDecoration: 'grey dotted underline' }}>{text}</b>
        </CTooltip>
      </CRow>
      <CRow>
        <CCol className="text-center">
          {!!subText && <div className="small text-muted">{subText}</div>}
        </CCol>
      </CRow>
    </div>
  )
}

export default InfoText
