let _ = require('lodash/fp')
let metrics = [
  'avg',
  'max',
  'min',
  'sum',
  'value_count',
  'weighted_avg',
  'cardinality',
  'median_absolute_deviation',
]
module.exports = {
  buildAgg: agg => ({
    [agg.key || agg.type]: {
      [agg.type]: _.extend(agg.data, {
        field: agg.field,
      }),
    },
  }),
  buildFilter: agg => ({
    [agg.type]: {
      [agg.field]: agg.data,
    },
  }),
  metrics,
  hasValidMetrics: context => !_.difference(context.include, metrics).length,
}
