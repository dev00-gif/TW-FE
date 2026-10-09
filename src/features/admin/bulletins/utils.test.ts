import { describe, expect, it } from 'vitest'
import { bulletinContentText } from './utils'

describe('bulletinContentText', () => {
  it('converts editor markup to safe plain text', () => {
    expect(
      bulletinContentText('<p>Hello <strong>world</strong> &amp; friends</p>'),
    ).toBe('Hello world & friends')
    expect(bulletinContentText('<p><br></p>')).toBe('')
  })
})
