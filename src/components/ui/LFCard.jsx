import React from 'react'
import { Card, CardContent, CardHeader } from '@mui/material'

export function LFCard({ title, action, children, ...rest }) {
  return (
    <Card {...rest}>
      {title && <CardHeader title={title} action={action} />}
      <CardContent>{children}</CardContent>
    </Card>
  )
}
