import _ from 'lodash/fp'
import { format as formatCSV } from '@fast-csv/format'
import { keysToObject } from './futil'
import { isIterable, isAsyncIterable } from './utils'

export let format = ({ transformHeaders = x => x, onWrite = _.noop, ...props }) => {
  let csv = formatCSV({...props, headers: true})
  let records = 0

  // Write headers as data since fast-csv doesn't support transformHeaders natively yet
  // If headers are ['a', 'b'], write a record like this: `{ a : transformHeaders('a'), b: transformHeaders('b') }`
  let writeHeaders = _.once(data => {
    let headers = props.headers || _.keys(data[0] || data)
    csv.write(keysToObject(transformHeaders, headers))
  })
  
  // object array support
  let writeRecordOrRecords = data => {
    console.log('writeRecordOrRecords', data)
    writeHeaders(data)
    if (_.tap(x => console.log('isArray',x),  _.isArray(data)) && _.tap(x => console.log('isPlainObject', x), _.isPlainObject(data[0])))
      console.log('writing data', data) || _.each(record => csv.write(_.tap(x => console.log('writing record', x), record)), data)
    else csv.write(data)
  }
  return {
    pipe: x => csv.pipe(x),
    end: () => csv.end(),
    write: async data => {
      console.log('writing data', data)
      // asyncIterator support
      if (isAsyncIterable(data))
        for await (let item of data)
          console.log('item', item) || writeRecordOrRecords(_.tap(x => console.log('item1', x), item))

      // iterator support
      else if (isIterable(data))
        for (let item of data)
          writeRecordOrRecords(_.tap(x => console.log('item2', item)))

      // default
      else writeRecordOrRecords(_.tap(x => console.log('data', data)))

      // TODO double check data.length works as expected for
      // both iterator types
      records = records + data.length
      await onWrite({ records })
    },
  }
}

export let writeToStream =  async (stream, data, config) => {
  let csv = format(config)
  csv.pipe(stream)
  await csv.write(data)
  csv.end()
}
