import annoTask from './annoTask'
import lost from './lost'
import mia from './mia'
import sia from './sia'
import siaReview from './siaReview'
import workers from './worker/index'

export default {
    ...annoTask,
    ...mia,
    ...sia,
    ...workers,
    ...siaReview,
    ...lost,
}
