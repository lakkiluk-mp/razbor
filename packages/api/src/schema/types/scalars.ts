import { builder } from '../builder'

builder.scalarType('DateTime', {
  serialize: (value) => value.toISOString(),
  parseValue: (value) => {
    const date = new Date(value as string)
    if (isNaN(date.getTime())) {
      throw new Error('Invalid DateTime format')
    }
    return date
  },
})
