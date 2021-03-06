import F from 'futil'
import _ from 'lodash/fp'
import React from 'react'
import { observer } from 'mobx-react'

import { withTheme } from '../utils/theme'

let ModalPicker = ({
  options = [],
  className = '',
  onChange,
  label,
  theme: { Button, NestedPicker, Modal },
  ...props
}) => {
  let open = React.useState(false)
  return (
    !!options.length && (
      <>
        <Modal open={open}>
          <NestedPicker
            options={options}
            onChange={x => {
              onChange(x)
              F.off(open)()
            }}
            {...props}
          />
        </Modal>
        <Button
          className={`modal-picker-button ${className}`}
          onClick={F.on(open)}
        >
          {label}
        </Button>
      </>
    )
  )
}

export default _.flow(observer, withTheme)(ModalPicker)
