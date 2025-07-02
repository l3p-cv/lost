import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../../components/IconButton'

interface NavRibbonProps {
    onNext: () => void
    onBack: () => void
    nextButtonClassName?: string
}

export const NavRibbon = ({ onNext, onBack, nextButtonClassName }: NavRibbonProps) => {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}
        >
            <div>
                <IconButton
                    icon={faArrowLeft}
                    text="Back"
                    onClick={onBack}
                    style={{ marginBottom: 20 }}
                />
            </div>

            <div>
                <IconButton
                    icon={faArrowRight}
                    text="Next"
                    onClick={onNext}
                    isTextLeft={true}
                    style={{ marginBottom: 20 }}
                    className={nextButtonClassName}
                />
            </div>
        </div>
    )
}
