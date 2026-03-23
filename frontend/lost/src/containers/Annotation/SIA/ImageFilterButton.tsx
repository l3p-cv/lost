import { CButton, CPopover, CTooltip } from '@coreui/react'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ImageFilterUi from './ImageFilter/ImageFilterUi'
import { ImageFilter } from '../../../types/SiaTypes'

type ImageFilterButtonProps = {
  isDisabled?: boolean
  appliedFilters?: ImageFilter[]
  tooltip?: String
  onFiltersChanged: (filters: ImageFilter[]) => void
  imageIsLoading?: boolean
}

const ImageFilterButton = ({
  isDisabled = false,
  appliedFilters = [],
  tooltip = '',
  onFiltersChanged = () => {},
  imageIsLoading = false,
}: ImageFilterButtonProps) => {
  const customPopoverStyle = {
    '--cui-popover-max-width': '300px',
    zIndex: 7000,
  }

  return (
    <CPopover
      placement="bottom"
      trigger="click"
      content={
        <ImageFilterUi
          appliedFilters={appliedFilters}
          onFiltersChanged={onFiltersChanged}
          imageIsLoading={imageIsLoading}
        />
      }
      style={customPopoverStyle}
    >
      <span className="d-inline-block">
        <CTooltip content={tooltip} placement="top">
          <CButton color="primary" disabled={isDisabled} variant="outline">
            <FontAwesomeIcon icon={faFilter as IconProp} />
          </CButton>
        </CTooltip>
      </span>
    </CPopover>
  )
}

export default ImageFilterButton
