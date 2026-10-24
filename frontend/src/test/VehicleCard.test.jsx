import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import VehicleCard from '../components/VehicleCard'

const car = { id: 7, make: 'Tata', model: 'Nexon EV', category: 'Electric', price: 1499000, quantity: 4, year: 2025, color: 'Pristine White' }

describe('VehicleCard', () => {
  it('shows the car details, price and plate', () => {
    render(<VehicleCard vehicle={car} />)
    expect(screen.getByRole('heading', { name: 'Nexon EV' })).toBeInTheDocument()
    expect(screen.getByText('₹14,99,000')).toBeInTheDocument()
    expect(screen.getByLabelText('Stock number KA 20 TA 0007')).toBeInTheDocument()
    expect(screen.getByTestId('stock')).toHaveTextContent('4 on the lot')
  })

  it('calls onBuy with the vehicle when Buy is clicked', async () => {
    const onBuy = vi.fn()
    render(<VehicleCard vehicle={car} onBuy={onBuy} />)
    await userEvent.click(screen.getByRole('button', { name: 'Buy this car' }))
    expect(onBuy).toHaveBeenCalledWith(car)
  })

  it('disables the purchase button when quantity is zero', async () => {
    const onBuy = vi.fn()
    render(<VehicleCard vehicle={{ ...car, quantity: 0 }} onBuy={onBuy} />)
    const button = screen.getByRole('button', { name: 'Sold out' })
    expect(button).toBeDisabled()
    await userEvent.click(button)
    expect(onBuy).not.toHaveBeenCalled()
  })

  it('hides admin controls from buyers', () => {
    render(<VehicleCard vehicle={car} isAdmin={false} />)
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('shows edit, restock and delete to admins', async () => {
    const onDelete = vi.fn()
    render(<VehicleCard vehicle={car} isAdmin onDelete={onDelete} onEdit={() => {}} onRestock={() => {}} />)
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Restock' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith(car)
  })
})
