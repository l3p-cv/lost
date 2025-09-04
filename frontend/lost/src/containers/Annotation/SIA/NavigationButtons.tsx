import { CButton, CButtonGroup } from '@coreui/react'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type NavigationButtonsProps = {
    onNextImagePressed: () => void
    onPreviousImagePressed: () => void
}

const NavigationButtons = ({
    onNextImagePressed,
    onPreviousImagePressed,
}: NavigationButtonsProps) => {
    return (
        <CButtonGroup role="group" aria-label="Basic example">
            <CButton color="primary" variant={'outline'} onClick={onPreviousImagePressed}>
                <FontAwesomeIcon icon={faArrowLeft as IconProp} size="lg" />
            </CButton>

            <CButton color="primary" variant={'outline'} onClick={onNextImagePressed}>
                <FontAwesomeIcon icon={faArrowRight as IconProp} size="lg" />
            </CButton>
        </CButtonGroup>
    )
}

export default NavigationButtons
