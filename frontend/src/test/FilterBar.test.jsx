import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FilterBar, { EMPTY_FILTERS } from '../components/FilterBar'

const categories = ['Sedan', 'SUV']

describe('FilterBar', () => {
  it('reports the new make when the user types', async () => {
    const onChange = vi.fn()
    render(<FilterBar filters={EMPTY_FILTERS} categories={categories} onChange={onChange} />)
    await userEvent.type(screen.getByLabelText('Make'), 'T')
    expect(onChange).toHaveBeenLastCalledWith({ ...EMPTY_FILTERS, make: 'T' })
  })

  it('selects a body type', async () => {
    const onChange = vi.fn()
    render(<FilterBar filters={EMPTY_FILTERS} categories={categories} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'SUV' }))
    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_FILTERS, category: 'SUV' })
  })

  it('marks the active body type as pressed', () => {
    render(<FilterBar filters={{ ...EMPTY_FILTERS, category: 'SUV' }} categories={categories} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'SUV' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'All types' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('only offers "Clear filters" when something is filtered, and it resets everything', async () => {
    const onChange = vi.fn()
    const { rerender } = render(<FilterBar filters={EMPTY_FILTERS} categories={categories} onChange={onChange} />)
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument()

    rerender(<FilterBar filters={{ ...EMPTY_FILTERS, max_price: '900000' }} categories={categories} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(onChange).toHaveBeenCalledWith(EMPTY_FILTERS)
  })
})
