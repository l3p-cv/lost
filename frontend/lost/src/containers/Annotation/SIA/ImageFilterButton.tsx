import { CButton, CPopover } from '@coreui/react'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ImageFilterUi from './ImageFilter/ImageFilterUi'
import { ImageFilter } from '../../../types/SiaTypes'

type ImageFilterButtonProps = {
  isDisabled?: boolean
  appliedFilters?: ImageFilter[]
  onFiltersChanged: (filters: ImageFilter[]) => void
}

const ImageFilterButton = ({
  isDisabled = false,
  appliedFilters = [],
  onFiltersChanged = () => {},
}: ImageFilterButtonProps) => {
  const customPopoverStyle = {
    '--cui-popover-max-width': '300px',
    zIndex: 7000,
  }

  return (
    <CPopover
      placement="bottom"
      trigger="click" // closes when clicking somewhere else
      content={
        <ImageFilterUi
          appliedFilters={appliedFilters}
          onFiltersChanged={onFiltersChanged}
        />
      }
      style={customPopoverStyle}
    >
      <CButton color="primary" disabled={isDisabled} variant="outline">
        <FontAwesomeIcon icon={faFilter as IconProp} />
      </CButton>
    </CPopover>
  )
}

export default ImageFilterButton
