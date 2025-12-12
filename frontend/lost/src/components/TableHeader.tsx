import { CCol, CRow } from '@coreui/react'
import CoreIconButton from './CoreIconButton'
import SelectFileButton from './SelectFileButton'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { CSSProperties } from 'react'

type TableHeaderProps = {
  headline?: string
  buttonStyle?: CSSProperties
  className?: string
  icon?: IconDefinition
  onClick?: () => void
  buttonText?: string
  buttonColor?: string
  selectFileButton?: boolean
  headerClassname?: string
  accept?: string
}

const TableHeader = ({
  headline,
  buttonStyle = {},
  className = '',
  icon = undefined,
  onClick = () => {},
  buttonText = '',
  buttonColor = 'primary',
  selectFileButton = false,
  headerClassname = '',
  accept = undefined,
}: TableHeaderProps) => {
  return (
    <CRow>
      <CCol className="mt-3 d-flex justify-content-between align-items-center">
        <h3 className={headerClassname}>{headline}</h3>
        {!selectFileButton && (
          <CoreIconButton
            className={className}
            isOutline={true}
            color={buttonColor}
            icon={icon}
            text={buttonText}
            onClick={onClick}
            style={buttonStyle}
          />
        )}
        {selectFileButton && (
          <SelectFileButton
            className={className}
            accept={accept}
            isOutline={true}
            color={buttonColor}
            icon={icon}
            text={buttonText}
            onSelect={onClick}
            style={buttonStyle}
          />
        )}
      </CCol>
    </CRow>
  )
}

export default TableHeader
