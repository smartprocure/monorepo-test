import React from 'react'
import F from 'futil-js'
import _ from 'lodash/fp'
import Async from 'react-select/lib/Async'
import { components } from 'react-select'
import { Flex } from '../greyVest'
import { contexturify } from '../utils/hoc'
import { Cardinality } from './Facet'

let getOptions = node =>
  _.map(
    ({ name, count }) => ({ ...F.autoLabelOption(name), count }),
    _.get('context.options', node)
  )

let FacetSelect = ({
  tree,
  node,
  hide = {
    counts: false, // Hide the facet counts so only the labels are displayed
    modeToggle: false, // Hide the toggle for the filter mode (include or exclude)
    cardinality: false, // Hide the total results and 'view more' controls
  },
  isMulti = true,
  display = x => x,
  formatCount = x => x,
  displayBlank = () => <i>Not Specified</i>,
  theme: { RadioList },
}) => {
  let MenuList = props => (
    <components.MenuList {...props}>
      {!hide.cardinality && (
        <div
          style={{
            boxShadow: '0 2px 2px -2px #CCC',
            fontSize: '0.9em',
            padding: '0 10px 1px',
            marginBottom: 4,
            opacity: 0.8,
          }}
        >
          <Cardinality {...{ node, tree }} />
        </div>
      )}
      {props.children}
    </components.MenuList>
  )

  return (
    <div className="contexture-facet-select">
      {!hide.modeToggle && (
        <RadioList
          value={node.mode || 'include'}
          onChange={mode => tree.mutate(node.path, { mode })}
          options={F.autoLabelOptions(['include', 'exclude'])}
        />
      )}
      <Async
        placeholder="Search..."
        isMulti={isMulti}
        cacheOptions
        defaultOptions={getOptions(node)}
        loadOptions={async val => {
          await tree.mutate(node.path, { optionsFilter: val })
          return getOptions(node)
        }}
        formatOptionLabel={({ label, count }, { context }) =>
          context === 'menu' ? (
            <Flex justifyContent="space-between">
              {display(label) || displayBlank()}
              <span>{!hide.counts && formatCount(count)}</span>
            </Flex>
          ) : (
            <span>
              {display(label) || displayBlank()}{' '}
              {!hide.counts && F.parens(formatCount(count))}
            </span>
          )
        }
        onChange={x => tree.mutate(node.path, { values: _.map('value', x) })}
        components={{ MenuList }}
      />
    </div>
  )
}

export default contexturify(FacetSelect)
