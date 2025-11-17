import { CButtonGroup } from '@coreui/react'
import {
  faArrowLeft,
  faArrowRight,
  faPaperPlane,
} from '@fortawesome/free-solid-svg-icons'
import { IconButton } from 'lost-sia'

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
      <IconButton
        color="primary"
        disabled={isFirstImage}
        icon={faArrowLeft}
        isOutline={true}
        onClick={onPreviousImagePressed}
        tooltip="Switch to previous image"
      />

      {!isLastImage && (
        <IconButton
          color="primary"
          icon={faArrowRight}
          isOutline={true}
          onClick={onNextImagePressed}
          tooltip="Switch to next image"
        />
      )}

      {isLastImage && (
        <IconButton
          color="primary"
          icon={faPaperPlane}
          isOutline={true}
          onClick={onSubmitAnnotask}
          tooltip="Finish annotation task"
        />
      )}
    </CButtonGroup>
  )
}

export default NavigationButtons
