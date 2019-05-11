import _ from 'lodash/fp'
import * as F from 'futil-js'

// Logic
export let onlyWhen = f => F.unless(f, () => {})

// Tree
export let FlattenTreeLeaves = Tree =>
  _.flow(
    Tree.flatten(),
    _.omitBy(Tree.traverse)
  )
export let PlainObjectTree = F.tree(onlyWhen(_.isPlainObject))
export let flattenPlainObject = F.whenExists(FlattenTreeLeaves(PlainObjectTree))

// (f, g) -> (x, y) -> {...f(x, y), ...g(x, y)}
export let mergeOverAll = fns =>
  _.flow(
    _.over(fns),
    _.mergeAll
  )
