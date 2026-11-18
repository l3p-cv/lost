import { CButtonGroup } from '@coreui/react'
import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faArrowLeft,
  faArrowRight,
  faPaperPlane,
} from '@fortawesome/free-solid-svg-icons'
import CoreIconButton from '../../../components/CoreIconButton'

type NavigationButtonsProps = {
  isFirstImage?: boolean
  isLastImage?: boolean
  isImageSearchActive?: boolean
  isReview?: boolean
  onNextImagePressed: () => void
  onPreviousImagePressed: () => void
  onSubmitAnnotask: () => void
  onFirstImagePressed?: () => void
  onLastImagePressed?: () => void
}

const NavigationButtons = ({
  isFirstImage = false,
  isLastImage = false,
  isImageSearchActive = false,
  isReview = false,
  onNextImagePressed,
  onPreviousImagePressed,
  onSubmitAnnotask,
  onFirstImagePressed,
  onLastImagePressed,
}: NavigationButtonsProps) => {
  /**
   * rules:
   * 1. always show arrow left button (disable it when in first image)
   * 2. replace  arrow right button with finish button when on last image in "normal mode"
   * 3. always show arrow right button when in search mode (but disable it on last image)
   * 4. always show jump-to-first and jump-to-last buttons (disable on their boundary)
   */

  return (
    <CButtonGroup role="group" aria-label="Basic example">
      <CoreIconButton color="primary" disabled={isFirstImage} icon={faAngleDoubleLeft} isOutline onClick={onFirstImagePressed} toolTip="Jump to first image" />
      <CoreIconButton
        color="primary"
        disabled={isFirstImage}
        icon={faArrowLeft}
        isOutline={true}
        onClick={onPreviousImagePressed}
        toolTip="Switch to previous image"
      />

      {(!isLastImage || isImageSearchActive || isReview) && (
        <CoreIconButton
          color="primary"
          disabled={isLastImage}
          icon={faArrowRight}
          isOutline={true}
          onClick={onNextImagePressed}
          toolTip={isLastImage && isReview ? 'End of annotated images' : 'Switch to next image'}
        />
      )}
      <CoreIconButton color="primary" disabled={isLastImage} icon={faAngleDoubleRight} isOutline onClick={onLastImagePressed} toolTip="Jump to last image" />

      {isLastImage && !isImageSearchActive && !isReview && (
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
