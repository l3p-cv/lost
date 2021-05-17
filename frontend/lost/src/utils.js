export const flatObj = (obj, concatenator = '.') =>
    Object.keys(obj).reduce((acc, key) => {
        if (typeof obj[key] !== 'object') {
            return {
                ...acc,
                [key]: obj[key],
            }
        }

        const flattenedChild = flatObj(obj[key], concatenator)

        return {
            ...acc,
            ...Object.keys(flattenedChild).reduce(
                (childAcc, childKey) => ({
                    ...childAcc,
                    [`${key}${concatenator}${childKey}`]: flattenedChild[childKey],
                }),
                {},
            ),
        }
    }, {})
