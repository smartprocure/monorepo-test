import Contexture from 'contexture'
import memory from 'contexture/src/provider-memory'
import types from 'contexture/src/provider-memory/exampleTypes'
import { observer } from 'mobx-react'
import React from 'react'
import ContextureMobx from './utils/contexture-mobx'
import { componentForType } from './utils/schema'
import { ResultTable, TypeMap } from './exampleTypes'

export let memoryService = (records, { schema, debug } = {}) =>
  Contexture({
    debug,
    // Hack to effectively set a default schema: if our tree root doesn't have
    // a `schema` property, it will get the schema at key `undefined`.
    schemas: { [schema]: { memory: { records } } },
    providers: { memory: { ...memory, types: types() } },
  })

export let useMemory = ({ schema, debug } = {}) => {
  let [storage] = React.useState({})
  let [service] = React.useState(Contexture({
    debug,
    schemas: { [schema]: { memory: storage } },
    providers: { memory: { ...memory, types: types() } },
  }))
  let updateMemory = records => {
    storage.records = records
  }
  return [service, updateMemory]
}

let MemoryTable = ({ data, fields, debug, include, ...props }) => {
  let [service, updateMemory] = useMemory({ schema: 'data', debug })
  let [tree] = React.useState(
    ContextureMobx({ service })({
      key: 'root',
      schema: 'data',
      children: [
        { key: 'results', type: 'results', include },
        { key: 'criteria', type: 'group', children: [] },
      ],
    })
  )

  updateMemory(data)
  tree.refresh(['root'])

  return (
    <ResultTable
      path={['root', 'results']}
      criteria={['root', 'criteria']}
      mapNodeToProps={componentForType(TypeMap)}
      {...{ fields, tree, ...props }}
    />
  )
}

export default observer(MemoryTable)
