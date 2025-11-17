import { useGetLabelTrees } from '../../actions/label/label-api'
import BaseContainer from '../../components/BaseContainer'
import { CenteredSpinner } from '../../components/CenteredSpinner'
import LabelTreeTable from './LabelTreeTable'
import { CContainer } from '@coreui/react'

const Labels = ({ visLevel, showHeader = true }) => {
  const { data: labelTrees, isLoading, isError } = useGetLabelTrees(visLevel)

  if (isLoading) {
    return <CenteredSpinner />
  }

  if (isError) {
    return <p>An error occurred when loading labels!</p>
  }

  if (labelTrees) {
    return (
      <CContainer style={{ marginTop: '15px' }} className="label-tree-container">
        {/* {showHeader && 
                <h3 className="card-title mb-3" style={{ textAlign: 'center' }}>
                    Labels
                </h3>} */}
        {/* <BaseContainer className="mt-3"> */}
        <LabelTreeTable labelTrees={labelTrees} visLevel={visLevel} />
        {/* </BaseContainer> */}
      </CContainer>
    )
  }
}

export default Labels
