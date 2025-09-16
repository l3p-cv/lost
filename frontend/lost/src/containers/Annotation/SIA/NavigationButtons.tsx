import { CButton, CButtonGroup } from '@coreui/react'
import {
    faArrowLeft,
    faArrowRight,
    faPaperPlane,
} from '@fortawesome/free-solid-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type NavigationButtonsProps = {
    isFirstImage?: boolean
    isLastImage?: boolean
    onNextImagePressed: () => void
    onPreviousImagePressed: () => void
    onSubmitAnnotask: () => void
}

const NavigationButtons = ({
    isFirstImage = false,
    isLastImage = false,
    onNextImagePressed,
    onPreviousImagePressed,
    onSubmitAnnotask,
}: NavigationButtonsProps) => {
    return (
        <CButtonGroup role="group" aria-label="Basic example">
            <CButton
                color="primary"
                variant={'outline'}
                disabled={isFirstImage}
                onClick={onPreviousImagePressed}
            >
                <FontAwesomeIcon icon={faArrowLeft as IconProp} size="lg" />
            </CButton>

            {!isLastImage && (
                <CButton color="primary" variant={'outline'} onClick={onNextImagePressed}>
                    <FontAwesomeIcon icon={faArrowRight as IconProp} size="lg" />
                </CButton>
            )}

            {isLastImage && (
                <CButton color="primary" variant={'outline'} onClick={onSubmitAnnotask}>
                    <FontAwesomeIcon icon={faPaperPlane as IconProp} size="lg" />
                </CButton>
            )}
        </CButtonGroup>
    )
}

export default NavigationButtons
