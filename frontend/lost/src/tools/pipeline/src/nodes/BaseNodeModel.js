// * to be able to extend getOutput in subclasses, by using the super method inside,
// the super method should only return the propertys it was created with,
// therefore we could use a weak map to save the 'params' keys.

// *
// const that = new WeakMap()

export default class BaseNodeModel {
	constructor(params){
		if(params === undefined || params.peN === undefined){
            throw new Error('Graph-Node parameters are or do not contain a peN property.')
        }
		// add all parameters as propertys
		Object.getOwnPropertyNames(params).forEach(key => {
			this[key] = params[key]
		})
		// *
		// that.set(this, Object.keys(params))
	}
	// may get overridden
	isValidated(){
		return true
	}
	// may get overridden
	getOutput(){
		// return all propertys
		// *
		// return that.get(this).reduce((result, key) => {
		return Object.getOwnPropertyNames(this).reduce((result, key) => {
			result[key] = this[key]
			return result
		}, {})
	}
}
