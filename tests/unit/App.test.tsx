import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../../src/App'
import { APP_NAME } from '../../src/config'

describe('App', () => {
  it('shows the app name', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: APP_NAME })).toBeInTheDocument()
  })
})
