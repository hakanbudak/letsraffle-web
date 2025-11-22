import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useManualCreate } from './useManualCreate'
import api from '@/services/api'
import confetti from 'canvas-confetti'

// Mock dependencies
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
  },
}))

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

// Mock alert
global.alert = vi.fn()

describe('useManualCreate', () => {
  const mockParticipants = ref([
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      address: '',
      phone: '',
      isOrganizer: false,
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      address: '',
      phone: '',
      isOrganizer: false,
    },
    {
      id: 3,
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@example.com',
      address: '',
      phone: '',
      isOrganizer: false,
    },
  ])

  const mockRequireAddress = ref(false)
  const mockRequirePhone = ref(false)

  beforeEach(() => {
    vi.clearAllMocks()
    mockParticipants.value = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        address: '',
        phone: '',
        isOrganizer: false,
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        address: '',
        phone: '',
        isOrganizer: false,
      },
      {
        id: 3,
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@example.com',
        address: '',
        phone: '',
        isOrganizer: false,
      },
    ]
    mockRequireAddress.value = false
    mockRequirePhone.value = false
  })

  it('should initialize with correct default values', () => {
    const { isCreatingEvent, showSuccessModal, isDrawCompleted } = useManualCreate({
      participants: mockParticipants,
      requireAddress: mockRequireAddress,
      requirePhone: mockRequirePhone,
    })

    expect(isCreatingEvent.value).toBe(false)
    expect(showSuccessModal.value).toBe(false)
    expect(isDrawCompleted.value).toBe(false)
  })

  it('should show alert when no participants', async () => {
    const emptyParticipants = ref([])
    const { handleCreateEvent } = useManualCreate({
      participants: emptyParticipants,
      requireAddress: mockRequireAddress,
      requirePhone: mockRequirePhone,
    })

    await handleCreateEvent()

    expect(global.alert).toHaveBeenCalled()
    expect(api.post).not.toHaveBeenCalled()
  })

  it('should show alert when less than 3 participants', async () => {
    const fewParticipants = ref([
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        address: '',
        phone: '',
        isOrganizer: false,
      },
    ])

    const { handleCreateEvent } = useManualCreate({
      participants: fewParticipants,
      requireAddress: mockRequireAddress,
      requirePhone: mockRequirePhone,
    })

    await handleCreateEvent()

    expect(global.alert).toHaveBeenCalled()
    expect(api.post).not.toHaveBeenCalled()
  })

  it('should create draw successfully with 3+ participants', async () => {
    const mockResponse = { data: { success: true, drawId: 123 } }
    ;(api.post as any).mockResolvedValue(mockResponse)

    const { handleCreateEvent, isDrawCompleted, showSuccessModal } = useManualCreate({
      participants: mockParticipants,
      requireAddress: mockRequireAddress,
      requirePhone: mockRequirePhone,
    })

    await handleCreateEvent()

    expect(api.post).toHaveBeenCalledWith('/api/v1/draws/manual', {
      addressRequired: false,
      phoneNumberRequired: false,
      participants: [
        { firstName: 'John', lastName: 'Doe', email: 'john@example.com', address: '', phone: '' },
        { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', address: '', phone: '' },
        { firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', address: '', phone: '' },
      ],
    })
    expect(confetti).toHaveBeenCalled()
    expect(isDrawCompleted.value).toBe(true)
    expect(showSuccessModal.value).toBe(true)
  })

  it('should handle API error', async () => {
    const mockError = new Error('API Error')
    ;(api.post as any).mockRejectedValue(mockError)

    const { handleCreateEvent, isCreatingEvent } = useManualCreate({
      participants: mockParticipants,
      requireAddress: mockRequireAddress,
      requirePhone: mockRequirePhone,
    })

    await handleCreateEvent()

    expect(global.alert).toHaveBeenCalled()
    expect(isCreatingEvent.value).toBe(false)
  })

  it('should reset draw state', () => {
    const { isDrawCompleted, resetDraw } = useManualCreate({
      participants: mockParticipants,
      requireAddress: mockRequireAddress,
      requirePhone: mockRequirePhone,
    })

    isDrawCompleted.value = true
    expect(isDrawCompleted.value).toBe(true)

    resetDraw()

    expect(isDrawCompleted.value).toBe(false)
    expect(mockParticipants.value).toEqual([])
  })

  it('should include address and phone requirements in payload', async () => {
    mockRequireAddress.value = true
    mockRequirePhone.value = true

    const mockResponse = { data: { success: true } }
    ;(api.post as any).mockResolvedValue(mockResponse)

    const { handleCreateEvent } = useManualCreate({
      participants: mockParticipants,
      requireAddress: mockRequireAddress,
      requirePhone: mockRequirePhone,
    })

    await handleCreateEvent()

    expect(api.post).toHaveBeenCalledWith(
      '/api/v1/draws/manual',
      expect.objectContaining({
        addressRequired: true,
        phoneNumberRequired: true,
      })
    )
  })
})

