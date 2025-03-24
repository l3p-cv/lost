import annoTask from './annoTask'
import auth from './auth'
import lost from './lost'
import mia from './mia'
import sia from './sia'
import siaReview from './siaReview'
import workers from './worker/index'

export default {
    ...auth,
    ...annoTask,
    ...mia,
    ...sia,
    ...workers,
    ...siaReview,
    ...lost,
}
