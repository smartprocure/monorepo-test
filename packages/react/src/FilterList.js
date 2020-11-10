import React from 'react'
import _ from 'lodash/fp'
import F from 'futil'
import { setDisplayName } from 'recompose'
import { observer } from 'mobx-react'
import { Expandable, Flex, Dynamic } from './greyVest'
import { fieldsToOptions } from './FilterAdder'
import { contexturifyWithoutLoader } from './utils/hoc'
import { bdJoin } from './styles/generic'
import {
  newNodeFromType,
  transformNodeFromField,
  getTypeLabel,
  getTypeLabelOptions,
} from './utils/search'
import { withTheme } from './utils/theme'

export let FilterActions = _.flow(
  setDisplayName('FilterActions'),
  observer,
  withTheme
)(
  ({
    node,
    tree,
    fields,
    popover,
    theme: { DropdownItem, Popover, Modal, NestedPicker },
  }) => {
    let modal = React.useState(false)
    let typeOptions = _.flow(
      _.getOr([], [node.field, 'typeOptions']),
      _.without([node.type])
    )(fields)

    return (
      <>
        <Modal open={modal}>
          <NestedPicker
            options={fieldsToOptions(fields)}
            onChange={field => {
              tree.replace(node.path, transformNodeFromField({ field, fields }))
              F.off(modal)()
            }}
          />
        </Modal>
        <Popover
          open={popover}
          arrow={false}
          position="bottom center"
          style={{ width: 'auto' }}
        >
          {!_.isEmpty(typeOptions) && (
            <>
              <DropdownItem className="filter-actions-selected-type">
                Filter type: <strong>{getTypeLabel(tree, node.type)}</strong>
              </DropdownItem>
              {_.map(
                x => (
                  <DropdownItem
                    key={x.value}
                    onClick={() =>
                      tree.replace(
                        node.path,
                        newNodeFromType(x.value, fields, node)
                      )
                    }
                  >
                    —Change to {x.label}
                  </DropdownItem>
                ),
                getTypeLabelOptions(tree, typeOptions)
              )}
              <div className="filter-actions-separator" />
            </>
          )}
          <DropdownItem onClick={F.on(modal)}>Pick Field</DropdownItem>
          {/* If only contexture-client diffed the tree before sending a request... */}
          {(node.hasValue || false) && (
            <DropdownItem onClick={() => tree.clear(node.path)}>
              Clear Filter
            </DropdownItem>
          )}
          <DropdownItem onClick={() => tree.remove(node.path)}>
            Delete Filter
          </DropdownItem>
        </Popover>
      </>
    )
  }
)

export let Label = _.flow(
  setDisplayName('Label'),
  observer,
  withTheme
)(({ tree, node, fields, children, theme: { Icon }, ...props }) => {
  let popover = React.useState(false)
  let modal = React.useState(false)
  let field = _.get('field', node)
  return (
    <Flex
      className={`filter-field-label ${
        _.get('hasValue', node) ? 'filter-field-has-value' : ''
      }`.trim()}
      style={{
        cursor: 'pointer',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span {...props}>
        {children || _.get([field, 'label'], fields) || field || ''}
      </span>
      {tree && node && (
        <>
          <span
            onClick={
              node.paused
                ? null
                : e => {
                    e.stopPropagation()
                    F.flip(popover)()
                  }
            }
          >
            <span className="filter-field-label-icon">
              <Icon icon="TableColumnMenu" />
            </span>
            <FilterActions
              node={node}
              tree={tree}
              fields={fields}
              popover={popover}
              modal={modal}
            />
          </span>
          {
            // Whitespace separator
            <div style={{ flexGrow: 1 }} />
          }
        </>
      )}
    </Flex>
  )
})

// we can't do this on export because FilterList is used internally
let FilterList = _.flow(
  setDisplayName('FilterList'),
  contexturifyWithoutLoader
)(
  ({
    tree,
    node,
    fields,
    mapNodeToProps = _.noop,
    mapNodeToLabel = _.noop,
    className,
    style,
    theme: { UnmappedNodeComponent, Button },
  }) => {
    let updateRequired =
      tree.disableAutoUpdate &&
      // find if any nodes in the tree are marked for update (i.e. usually nodes are marked for update because they react to "others" reactor)
      _.some(
        treeNode => treeNode !== node && treeNode.markedForUpdate,
        F.treeToArray(_.get('children'))(tree.tree)
      )

    return (
      <div style={style} className={className}>
        {_.map(
          child =>
            child.children ? (
              <FilterList
                key={child.path}
                tree={tree}
                node={child}
                fields={fields}
                mapNodeToProps={mapNodeToProps}
                mapNodeToLabel={mapNodeToLabel}
                className={'filter-list-group'}
                style={bdJoin(child)}
              />
            ) : (
              <Expandable
                key={child.path}
                className="filter-list-item"
                isOpen={!child.paused}
                Label={
                  <Label tree={tree} node={child} fields={fields}>
                    {mapNodeToLabel(child, fields)}
                  </Label>
                }
                onClick={() =>
                  tree && tree.mutate(child.path, { paused: !child.paused })
                }
              >
                <div className="filter-list-item-contents">
                  <Dynamic
                    {...{
                      component: UnmappedNodeComponent,
                      tree,
                      node: child,
                      path: _.toArray(child.path),
                      ...mapNodeToProps(child, fields),
                    }}
                  />
                </div>
              </Expandable>
            ),
          _.get('children', node)
        )}

        <div
          className={`apply-filter ${updateRequired ? 'active' : ''}`}
          style={{
            maxHeight: updateRequired ? 70 : 0,
          }}
          onClick={e => {
            e.stopPropagation()
            tree.triggerUpdate()
          }}
        >
          <Button primary>
            <Flex justifyContent="center" alignItems="center">
              Search
            </Flex>
          </Button>
        </div>
      </div>
    )
  }
)

export default FilterList
