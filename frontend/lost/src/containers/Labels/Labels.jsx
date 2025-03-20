import { useGetLabelTrees } from '../../actions/label/label-api'
import BaseContainer from '../../components/BaseContainer'
import { CenteredSpinner } from '../../components/CenteredSpinner'
import CreateLabelTree from './CreateLabelTree'
import LabelTreeTable from './LabelTreeTable'

const Labels = ({ visLevel }) => {
    const { data: labelTrees, isLoading, isError } = useGetLabelTrees(visLevel)

    if (isLoading) {
        return <CenteredSpinner />
    }

    if (isError) {
        return <p>An error occurred when loading labels!</p>
    }

    if (labelTrees) {
        return (
            <BaseContainer className="mt-3">
                <CreateLabelTree visLevel={visLevel} />

                <LabelTreeTable labelTrees={labelTrees} visLevel={visLevel} />
            </BaseContainer>
        )
    }
}

export default Labels
