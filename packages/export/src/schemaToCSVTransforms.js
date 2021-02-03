import _ from 'lodash/fp'
import { updateMany, ensureKeys } from './futil'
import F from 'futil'

// Maps contexture schemas to tranforms for fast-csv
export let schemaToCSVTransforms = (schema, {logger = _.noop, header = true, include, displayDefault=_.identity} = {}) => {
  let count = 0
  let transformedHeaders =  include && F.arrayToObject(_.identity,v=>_.getOr(_.startCase(v),`${v}.label`,schema),include)
  if (include) schema = ensureKeys(include, schema, {})

  let headers = _.mapValues('label', schema)
  return {
    transformedHeaders,
    transformHeaders: key => headers[key] || _.startCase(key),
    // NOTE: for whatever reason you can't use a function declared
    // by _.flow as transaform, just `transform: _.identity` works as expected
    // but `transform: _.flow(_.identity)` does write a csv and doesn't throw any errors :(
    // _.flow might be hitting the fast-csv callback api for transform but not really sure
    transform: row => _.flow(
      include ? _.pick(include) : _.identity,
      _.cond([
        [() => header && count === 0, _.identity], // don't format the header
        [_.stubTrue, updateMany(_.mapValues(o => o.display || displayDefault, schema))],
      ]),
      _.tap(record => logger(count, record)),
      _.tap(() => count++),
    )(row),
    writeHeaders: false
  }
}

// This is an example for testing, but could potentially be useful
export let schemaToCSVTransformsWithLogging = (
  schema,
  total,
  logger = console.info // eslint-disable-line no-console
) =>
  schemaToCSVTransforms(schema, {
    logger: count => logger(`Records ${count} of ${total}`)
  })
