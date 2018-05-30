import _ from 'lodash/fp'
import * as F from 'futil-js'
import { flatten, bubbleUp, Tree, encode, decode, isParent } from './util/tree'
import { validate } from './validation'
import { getAffectedNodes } from './reactors'
import actions from './actions'
import serialize from './serialize'
import traversals from './traversals'
import { runTypeFunction } from './types'
import { initNode, hasContext, hasValue } from './node'
import exampleTypes from './exampleTypes'
import lens from './lens'
import mockService from './mockService'
import cascade from './cascade'

let mergeWith = _.mergeWith.convert({ immutable: false })

let shouldBlockUpdate = flat => {
  let leaves = Tree.flatLeaves(flat)
  let noUpdates = !_.some('markedForUpdate', leaves)
  let hasErrors = _.some('error', leaves)
  return hasErrors || noUpdates
}

let isStale = (result, target) =>
  target.lastUpdateTime &&
  result.lastUpdateTime &&
  target.lastUpdateTime > result.lastUpdateTime

let defaultService = () => {
  throw new Error('No update service provided!')
}

// Export useful utils which might be needed for extending the core externally
export { Tree, encode, decode, exampleTypes, hasContext, hasValue, mockService, cascade }

export let ContextTree = _.curry(
  (
    {
      service = defaultService,
      types = exampleTypes,
      debounce = 500,
      onResult = _.noop,
      debug,
      extend = F.extendOn,
      onChange = _.noop,
      snapshot = _.cloneDeep,
    },
    tree
  ) => {
    let log = x => debug && console.info(x)
    let flat = flatten(tree)
    let getNode = path => flat[encode(path)]
    let customReactors = {}

    F.eachIndexed(
      (node, path) => initNode(node, decode(path), extend, types),
      flat
    )

    // overwriting extend
    extend = _.over([extend, onChange])

    // Getting the Traversals
    let { markForUpdate, markLastUpdate, prepForUpdate } = traversals(extend)

    let processEvent = event => path =>
      F.flurry(
        getAffectedNodes(customReactors, getNode, types),
        // Mark children only if it's not a parent of the target so we don't incorrectly mark siblings
        _.each(n => {
          F.unless(isParent(n.path, event.path), Tree.walk)(markForUpdate)(n)
        })
      )(event, path)

    // Event Handling
    let dispatch = async event => {
      log(`${event.type} event at ${event.path}`)
      await validate(runTypeFunction(types, 'validate'), extend, tree)
      bubbleUp(processEvent(event), event.path)
      await triggerUpdate()
    }

    let triggerUpdate = F.debounceAsync(debounce, async () => {
      if (shouldBlockUpdate(flat)) return log('Blocked Search')
      let now = new Date().getTime()
      markLastUpdate(now)(tree)
      let dto = serialize(snapshot(tree), { search: true })
      prepForUpdate(tree)
      processResponse(await service(dto, now))
    })

    let processResponse = data => {
      // TODO: Remove these 3 deprecated lines in 3.0. Errors will just be on the tree so no need to wrap in `data` to allow `error`
      data = _.isEmpty(data.data) ? data : data.data
      let { error } = data
      if (error) extend(tree, { error })

      F.eachIndexed((node, path) => {
        let target = flat[path]
        let responseNode = _.pick(['context', 'error'], node)
        if (target && !_.isEmpty(responseNode) && !isStale(node, target)) {
          TreeInstance.onResult(decode(path), node, target)
          mergeWith((oldValue, newValue) => newValue, target, responseNode)
          extend(target, { updating: false })
          target.updatingDeferred.resolve()
        }
      }, flatten(data))
    }

    let TreeInstance = {
      serialize: () => serialize(snapshot(tree), {}),
      dispatch,
      getNode,
      tree,
      addActions: create =>
        F.extendOn(
          TreeInstance,
          create({ getNode, flat, dispatch, snapshot, extend, types, initNode })
        ),
      addReactors: create => F.extendOn(customReactors, create()),
      onResult
    }

    TreeInstance.addActions(actions)
    TreeInstance.lens = lens(TreeInstance)
    return TreeInstance
  }
)
export default ContextTree
