import { CButton, CPopover } from '@coreui/react'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ImageFilterUi from './ImageFilter/ImageFilterUi'
import { ImageFilter } from '../../../types/SiaTypes'

type ImageFilterButtonProps = {
    isDisabled?: boolean
    onFiltersChanged: (filters: ImageFilter[]) => void
}

const ImageFilterButton = ({
    isDisabled = false,
    onFiltersChanged = () => {},
}: ImageFilterButtonProps) => {
    const customPopoverStyle = {
        '--cui-popover-max-width': '300px',
    }

    return (
        <CPopover
            placement="bottom"
            content={<ImageFilterUi onFiltersChanged={onFiltersChanged} />}
            style={customPopoverStyle}
        >
            <CButton color="primary" disabled={isDisabled} variant="outline">
                <FontAwesomeIcon icon={faFilter as IconProp} size="lg" />
            </CButton>
        </CPopover>
    )
}

export default ImageFilterButton
