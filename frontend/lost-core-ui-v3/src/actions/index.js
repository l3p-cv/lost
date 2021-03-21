import auth from './auth'
import label from './label/index'
import group from './group/index'
import user from './user/index'
import annoTask from './annoTask'
import mia from './mia'
import sia from './sia'
import workers from './worker/index';
import siaReview from './siaReview'
import lost from './lost'
import pipelineRunning from './pipeline/pipelineRunning'
import pipelineStart from './pipeline/pipelineStart'

export default { ...auth, ...label, ...group, ...user, ...annoTask, ...mia, ...sia, ...workers, ...siaReview, ...lost, ...pipelineRunning,...pipelineStart}
