import React from 'react'
import _ from 'lodash/fp'
import F from 'futil-js'
import { Component } from '../utils/mobx-react-utils'
import styles from '../styles'
import { oppositeJoin } from '../utils/search'
let { btn, joinColor, bgJoin } = styles

let OperatorMenu = ({ node, parentState, root, parent }) => (
  <div>
    {_.map(
      join =>
        node.join !== join && (
          <div
            key={join}
            {...F.domLens.hover(x => (parentState.joinHover = x && join))}
            style={{ ...btn, ...bgJoin(join) }}
            onClick={() => root.join(node, join)}
          >
            To {join.toUpperCase()}
          </div>
        ),
      ['and', 'or', 'not']
    )}
    <div>
      <div
        style={{
          ...btn,
          color: joinColor(oppositeJoin((parent || node).join)),
          marginTop: 5,
        }}
        {...F.domLens.hover(parentState.lens.wrapHover)}
        onClick={() => {
          root.indent(parent, node)
          F.off(parentState.lens.wrapHover)()
        }}
      >
        Wrap in {oppositeJoin((parent || node).join).toUpperCase()}
      </div>
    </div>
    <div>
      <div
        {...F.domLens.hover(parentState.lens.removeHover)}
        style={{ ...btn, marginTop: 5 }}
        onClick={() => root.remove(parent, node)}
      >
        Remove
      </div>
    </div>
  </div>
)
OperatorMenu.displayName = 'OperatorMenu'

export default Component(OperatorMenu)
