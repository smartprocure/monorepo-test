import _ from 'lodash/fp'
import F from 'futil'

export let flattenProp = _.curry((prop, target) =>
  _.flow(F.expandObject(_.get(prop)), _.unset(prop))(target)
)

// See R.evolve
export let transformat = _.curry((rules, data) => {
  let clone = _.cloneDeep(data)
  F.eachIndexed((display, field) =>
    F.updateOn(field, value => display(value, clone), clone)
  )(F.compactObject(rules))
  return clone
})

// F.ArrayToObject with keys as array values
// (['a', 'b'], x => x + 'c') => { a: 'ac', b: 'bc' }
export let keysToObject = _.curry(
  (toValue, data) => F.arrayToObject(x => x, toValue, data)
)
// Native JS implementation reference if fast-csv authors are curious
// let keysToObject = (f, data) =>
//   data.reduce((result, value) => {
//     result[value] = f(value)
//     return result
//   }, {})

// Fills in missing keys on an object with a default value
export let ensureKeys = _.curry(
  (keys, data, defaultValue = '') =>
    _.defaults(keysToObject(() => defaultValue, keys), data)
)

// _.get for an array of keys (in order)
export let getAll = _.curry(
  (keys, data) => _.map(key => _.get(key, data), keys)
)