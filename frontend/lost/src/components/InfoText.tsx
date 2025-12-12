import { CCol, CRow, CTooltip } from '@coreui/react'
import { CSSProperties } from 'react'

type InfoTextProps = {
  text?: string | null
  subText?: string | null
  style?: CSSProperties
  className?: string
  toolTip?: string | null
  tTipPlacement?: 'top' | 'left' | 'right' | 'auto' | 'bottom' | undefined
  id?: string | undefined
}

const InfoText = ({
  text = null,
  subText = null,
  style = {},
  className = '',
  toolTip = null,
  tTipPlacement = 'top',
  id = undefined,
}: InfoTextProps) => {
  return (
    <div id={id} className={className} style={style}>
      <CRow>
        {!!toolTip && (
          <CTooltip content={toolTip} placement={tTipPlacement}>
            <b style={{ textDecoration: 'grey dotted underline' }}>{text}</b>
          </CTooltip>
        )}
        {!toolTip && <b>{text}</b>}
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
