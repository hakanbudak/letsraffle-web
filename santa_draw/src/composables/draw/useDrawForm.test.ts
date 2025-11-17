import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDrawForm } from './useDrawForm'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

describe('useDrawForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with empty form and participants', () => {
    const { form, participants, requireAddress, requirePhone } = useDrawForm()

    expect(form.firstName.value).toBe('')
    expect(form.lastName.value).toBe('')
    expect(form.email.value).toBe('')
    expect(participants.value).toEqual([])
    expect(requireAddress.value).toBe(false)
    expect(requirePhone.value).toBe(false)
  })

  it('should validate form correctly', () => {
    const { form, validateForm, requireAddress, requirePhone } = useDrawForm()

    // Empty form should be invalid
    expect(validateForm()).toBe(false)
    expect(form.firstName.inValidMessage).toBeTruthy()
    expect(form.lastName.inValidMessage).toBeTruthy()
    expect(form.email.inValidMessage).toBeTruthy()

    // Fill required fields
    form.firstName.value = 'John'
    form.lastName.value = 'Doe'
    form.email.value = 'john@example.com'

    expect(validateForm()).toBe(true)
  })

  it('should validate email format', () => {
    const { form, validateForm } = useDrawForm()

    form.firstName.value = 'John'
    form.lastName.value = 'Doe'
    form.email.value = 'invalid-email'

    expect(validateForm()).toBe(false)
    expect(form.email.inValidMessage).toBeTruthy()

    form.email.value = 'valid@example.com'
    expect(validateForm()).toBe(true)
  })

  it('should require address when requireAddress is true', () => {
    const { form, requireAddress, validateForm } = useDrawForm()

    requireAddress.value = true
    form.firstName.value = 'John'
    form.lastName.value = 'Doe'
    form.email.value = 'john@example.com'

    expect(validateForm()).toBe(false)
    expect(form.address.inValidMessage).toBeTruthy()

    form.address.value = '123 Main St'
    expect(validateForm()).toBe(true)
  })

  it('should require phone when requirePhone is true', () => {
    const { form, requirePhone, validateForm } = useDrawForm()

    requirePhone.value = true
    form.firstName.value = 'John'
    form.lastName.value = 'Doe'
    form.email.value = 'john@example.com'

    expect(validateForm()).toBe(false)
    expect(form.phone.inValidMessage).toBeTruthy()

    form.phone.value = '1234567890'
    expect(validateForm()).toBe(true)
  })

  it('should add participant when form is valid', () => {
    const { form, participants, handleAddParticipant } = useDrawForm()

    form.firstName.value = 'John'
    form.lastName.value = 'Doe'
    form.email.value = 'john@example.com'

    handleAddParticipant()

    expect(participants.value).toHaveLength(1)
    expect(participants.value[0].firstName).toBe('John')
    expect(participants.value[0].lastName).toBe('Doe')
    expect(participants.value[0].email).toBe('john@example.com')
    expect(form.firstName.value).toBe('') // Form should be reset
  })

  it('should not add participant when form is invalid', () => {
    const { form, participants, handleAddParticipant } = useDrawForm()

    form.firstName.value = 'John'
    // Missing lastName and email

    handleAddParticipant()

    expect(participants.value).toHaveLength(0)
  })

  it('should edit participant', () => {
    const { form, participants, handleAddParticipant, editParticipant } = useDrawForm()

    // Add a participant
    form.firstName.value = 'John'
    form.lastName.value = 'Doe'
    form.email.value = 'john@example.com'
    handleAddParticipant()

    const participantId = participants.value[0].id

    // Edit the participant
    editParticipant(participants.value[0])

    expect(form.firstName.value).toBe('John')
    expect(form.lastName.value).toBe('Doe')
    expect(form.email.value).toBe('john@example.com')

    // Update the form
    form.firstName.value = 'Jane'
    handleAddParticipant()

    expect(participants.value).toHaveLength(1)
    expect(participants.value[0].firstName).toBe('Jane')
    expect(participants.value[0].id).toBe(participantId)
  })

  it('should remove participant', () => {
    const { form, participants, handleAddParticipant, removeParticipant } = useDrawForm()

    // Add participants
    form.firstName.value = 'John'
    form.lastName.value = 'Doe'
    form.email.value = 'john@example.com'
    handleAddParticipant()

    form.firstName.value = 'Jane'
    form.lastName.value = 'Smith'
    form.email.value = 'jane@example.com'
    handleAddParticipant()

    expect(participants.value).toHaveLength(2)

    // Remove first participant
    removeParticipant(participants.value[0].id)

    expect(participants.value).toHaveLength(1)
    expect(participants.value[0].email).toBe('jane@example.com')
  })

  it('should prevent duplicate emails', () => {
    const { form, participants, handleAddParticipant } = useDrawForm()

    form.firstName.value = 'John'
    form.lastName.value = 'Doe'
    form.email.value = 'john@example.com'
    handleAddParticipant()

    // Try to add same email again
    form.firstName.value = 'Jane'
    form.lastName.value = 'Smith'
    form.email.value = 'john@example.com'

    const { validateForm } = useDrawForm()
    expect(validateForm()).toBe(false)
  })

  it('should reset form', () => {
    const { form, resetForm } = useDrawForm()

    form.firstName.value = 'John'
    form.lastName.value = 'Doe'
    form.email.value = 'john@example.com'
    form.address.value = '123 Main St'
    form.phone.value = '1234567890'

    resetForm()

    expect(form.firstName.value).toBe('')
    expect(form.lastName.value).toBe('')
    expect(form.email.value).toBe('')
    expect(form.address.value).toBe('')
    expect(form.phone.value).toBe('')
    expect(form.firstName.inValidMessage).toBe('')
  })

  it('should clear error for specific field', () => {
    const { form, validateForm, clearError } = useDrawForm()

    validateForm() // This will set errors
    expect(form.firstName.inValidMessage).toBeTruthy()

    clearError('firstName')
    expect(form.firstName.inValidMessage).toBe('')
  })
})

