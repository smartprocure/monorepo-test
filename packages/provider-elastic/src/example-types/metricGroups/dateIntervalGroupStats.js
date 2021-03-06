let moment = require('moment-timezone')
let { groupStats } = require('./groupStatUtils')

let drilldown = ({ field, interval, drilldown }) => {
  let gte = drilldown
  let lte = moment
    .parseZone(drilldown)
    .endOf(interval)
    .format()
  return { range: { [field]: { gte, lte } } }
}
let buildGroupQuery = ({ field, interval = 'year' }, children, groupsKey) => ({
  aggs: {
    [groupsKey]: {
      date_histogram: { field, interval, min_doc_count: 0 },
      ...children,
    },
  },
})

module.exports = {
  ...groupStats(buildGroupQuery),
  drilldown,
}
