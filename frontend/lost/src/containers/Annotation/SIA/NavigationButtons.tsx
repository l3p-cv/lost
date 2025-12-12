import { CButtonGroup } from '@coreui/react'
import {
  faArrowLeft,
  faArrowRight,
  faPaperPlane,
} from '@fortawesome/free-solid-svg-icons'
import CoreIconButton from '../../../components/CoreIconButton'

type NavigationButtonsProps = {
  isFirstImage?: boolean
  isLastImage?: boolean
  isImageSearchActive?: boolean
  onNextImagePressed: () => void
  onPreviousImagePressed: () => void
  onSubmitAnnotask: () => void
}

const NavigationButtons = ({
  isFirstImage = false,
  isLastImage = false,
  isImageSearchActive = false,
  onNextImagePressed,
  onPreviousImagePressed,
  onSubmitAnnotask,
}: NavigationButtonsProps) => {
  /**
   * rules:
   * 1. always show arrow left button (disable it when in first image)
   * 2. replace  arrow right button with finish button when on last image in "normal mode"
   * 3. always show arrow right button when in search mode (but disable it on last image)
   */

  return (
    <CButtonGroup role="group" aria-label="Basic example">
      <CoreIconButton
        color="primary"
        disabled={isFirstImage}
        icon={faArrowLeft}
        isOutline={true}
        onClick={onPreviousImagePressed}
        toolTip="Switch to previous image"
      />

      {(!isLastImage || isImageSearchActive) && (
        <CoreIconButton
          color="primary"
          disabled={isLastImage}
          icon={faArrowRight}
          isOutline={true}
          onClick={onNextImagePressed}
          toolTip="Switch to next image"
        />
      )}

      {isLastImage && !isImageSearchActive && (
        <CoreIconButton
          color="primary"
          icon={faPaperPlane}
          isOutline={true}
          onClick={onSubmitAnnotask}
          toolTip="Finish annotation task"
        />
      )}
    </CButtonGroup>
  )
}

export default NavigationButtons
