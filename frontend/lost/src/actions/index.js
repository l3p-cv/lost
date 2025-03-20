import annoTask from './annoTask'
import auth from './auth'
import group from './group/index'
import lost from './lost'
import mia from './mia'
import pipelineRunning from './pipeline/pipelineRunning'
import pipelineStart from './pipeline/pipelineStart'
import sia from './sia'
import siaReview from './siaReview'
import user from './user/index'
import workers from './worker/index'

export default {
    ...auth,
    ...group,
    ...user,
    ...annoTask,
    ...mia,
    ...sia,
    ...workers,
    ...siaReview,
    ...lost,
    ...pipelineRunning,
    ...pipelineStart,
}
