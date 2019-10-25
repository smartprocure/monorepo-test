import React from 'react'
import _ from 'lodash/fp'
import F from 'futil-js'
import { contexturify } from '../utils/hoc'
import { getTagStyle } from '../utils/tagsQuery'
import { useLens } from '../utils/react'
import TagQueryPopover from './TagQueryPopover'

const field = 'word'

let TagsQuery = ({
  tree,
  node,
  placeholder,
  theme: { Popover, TagsInput },
  ...props
}) => {
  let open = useLens(false)
  let [selectedTag, setSelectedTag] = React.useState(null)
  return (
    <>
      <TagsInput
        splitCommas
        tags={_.map(field, node.tags)}
        onTagClick={tag => {
          F.on(open)()
          setSelectedTag(tag)
        }}
        addTag={tag => {
          tree.mutate(node.path, {
            tags: [...node.tags, { [field]: tag, distance: 3 }],
          })
        }}
        removeTag={tag => {
          tree.mutate(node.path, {
            tags: _.reject({ [field]: tag }, node.tags),
          })
        }}
        tagStyle={getTagStyle(node, field)}
        submit={tree.triggerUpdate}
        placeholder={placeholder}
        {...props}
      />
      <Popover open={open}>
        <TagQueryPopover tag={selectedTag} node={node} tree={tree} />
      </Popover>
    </>
  )
}

export default contexturify(TagsQuery)
