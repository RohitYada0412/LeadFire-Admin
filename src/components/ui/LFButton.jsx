import React from 'react'
import Button from '@mui/material/Button'

export const LFButton = React.forwardRef(function LFButton({ children, ...props }, ref) {
  return (
    <Button ref={ref} {...props}>
      {children}
    </Button>
  )
})
