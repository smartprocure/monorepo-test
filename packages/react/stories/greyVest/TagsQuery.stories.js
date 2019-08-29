import _ from 'lodash/fp'
import React from 'react'
import { storiesOf } from '@storybook/react'
import TestTree from '../testTree'
import { TagsQuery } from './../../src/exampleTypes'
import decorator from './decorator'

let tags = _.times(n => ({ word: `(${n}) This is a tag` }), 5)

let treeWithTags = TestTree(testTree => {
  testTree.getNode(['tagsQuery']).tags = tags
  return testTree
})

storiesOf('Search Components (Grey Vest)|Example Types/Tags Query', module)
  .addDecorator(decorator)
  .addWithJSX('Default', () => (
    <TagsQuery tree={treeWithTags} path={['tagsQuery']} />
  ))
  .addWithJSX('Responsive', () => (
    <div style={{ maxWidth: 500 }}>
      <TagsQuery tree={treeWithTags} path={['tagsQuery']} />
    </div>
  ))
