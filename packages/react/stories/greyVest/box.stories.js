import React from 'react'
import { storiesOf } from '@storybook/react'
import { Box } from './../../src/greyVest'
import decorator from './decorator'

storiesOf('Components|GreyVest Library', module)
  .addDecorator(decorator)
  .addWithJSX('Box', () => <Box>Box Contents</Box>)
