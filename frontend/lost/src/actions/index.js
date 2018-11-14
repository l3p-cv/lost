import auth from './auth'
import label from './label/index'
import group from './group/index'
import user from './user/index'

export default { ...auth, ...label, ...group, ...user }
