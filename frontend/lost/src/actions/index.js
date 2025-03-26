import annoTask from './annoTask'
import lost from './lost'
import mia from './mia'
import sia from './sia'
import siaReview from './siaReview'

export default {
    ...annoTask,
    ...mia,
    ...sia,
    ...siaReview,
    ...lost,
}
