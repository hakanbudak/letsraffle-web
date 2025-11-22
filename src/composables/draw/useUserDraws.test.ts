import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useUserDraws } from './useUserDraws'
import api from '@/services/api'
import { TOKEN_KEY, USER_KEY } from '@/services/authHelpers'

// Mock dependencies
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useUserDraws', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('should initialize with empty draws when no token', async () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === TOKEN_KEY) return null
      if (key === USER_KEY) return null
      return null
    })

    const { activeDraws, isLoading } = useUserDraws()

    // Wait for onMounted to complete
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(activeDraws.value).toEqual([])
    expect(isLoading.value).toBe(false)
  })

  it('should fetch user draws successfully', async () => {
    const mockUser = { id: 123, email: 'test@example.com' }
    const mockDraws = [
      {
        id: 1,
        drawType: 'dynamic',
        status: 'active',
        inviteCode: 'test-code',
        participantCount: 5,
        createdAt: '2024-01-01T00:00:00Z',
        drawDate: null,
      },
    ]

    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === TOKEN_KEY) return 'mock-token'
      if (key === USER_KEY) return JSON.stringify(mockUser)
      return null
    })

    ;(api.get as any).mockResolvedValue({ data: mockDraws })

    const { activeDraws, isLoading, fetchUserDraw } = useUserDraws()

    await fetchUserDraw()

    expect(api.get).toHaveBeenCalledWith('/api/v1/draws')
    expect(activeDraws.value).toHaveLength(1)
    expect(activeDraws.value[0].id).toBe(1)
    expect(activeDraws.value[0].status).toBe('active')
    expect(isLoading.value).toBe(false)
  })

  it('should filter out completed draws', async () => {
    const mockUser = { id: 123, email: 'test@example.com' }
    const mockDraws = [
      {
        id: 1,
        drawType: 'dynamic',
        status: 'completed',
        inviteCode: 'test-code',
        participantCount: 5,
        createdAt: '2024-01-01T00:00:00Z',
        drawDate: null,
      },
    ]

    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === TOKEN_KEY) return 'mock-token'
      if (key === USER_KEY) return JSON.stringify(mockUser)
      return null
    })

    ;(api.get as any).mockResolvedValue({ data: mockDraws })

    const { activeDraws, fetchUserDraw } = useUserDraws()

    await fetchUserDraw()

    expect(activeDraws.value).toEqual([])
  })

  it('should include in_progress status draws', async () => {
    const mockUser = { id: 123, email: 'test@example.com' }
    const mockDraws = [
      {
        id: 1,
        drawType: 'dynamic',
        status: 'in_progress',
        inviteCode: 'test-code',
        participantCount: 5,
        createdAt: '2024-01-01T00:00:00Z',
        drawDate: null,
      },
    ]

    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === TOKEN_KEY) return 'mock-token'
      if (key === USER_KEY) return JSON.stringify(mockUser)
      return null
    })

    ;(api.get as any).mockResolvedValue({ data: mockDraws })

    const { activeDraws, fetchUserDraw } = useUserDraws()

    await fetchUserDraw()

    expect(activeDraws.value).toHaveLength(1)
    expect(activeDraws.value[0].status).toBe('in_progress')
  })

  it('should handle 404 error gracefully', async () => {
    const mockUser = { id: 123, email: 'test@example.com' }
    const mockError = {
      response: { status: 404 },
    }

    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === TOKEN_KEY) return 'mock-token'
      if (key === USER_KEY) return JSON.stringify(mockUser)
      return null
    })

    ;(api.get as any).mockRejectedValue(mockError)

    const { activeDraws, error, fetchUserDraw } = useUserDraws()

    await fetchUserDraw()

    expect(activeDraws.value).toEqual([])
    expect(error.value).toBeNull()
  })

  it('should handle other API errors', async () => {
    const mockUser = { id: 123, email: 'test@example.com' }
    const mockError = {
      response: {
        status: 500,
        data: { message: 'Server error' },
      },
    }

    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === TOKEN_KEY) return 'mock-token'
      if (key === USER_KEY) return JSON.stringify(mockUser)
      return null
    })

    ;(api.get as any).mockRejectedValue(mockError)

    const { activeDraws, error, fetchUserDraw } = useUserDraws()

    await fetchUserDraw()

    expect(activeDraws.value).toEqual([])
    expect(error.value).toBeTruthy()
  })

  it('should fetch draw detail', async () => {
    const mockDrawDetail = {
      id: 1,
      drawType: 'dynamic',
      status: 'active',
      inviteCode: 'test-code',
      requireAddress: true,
      requirePhone: false,
      drawDate: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      language: 'tr',
      participantCount: 5,
      participants: [],
    }

    ;(api.get as any).mockResolvedValueOnce({ data: [] })
    ;(api.get as any).mockResolvedValueOnce({ data: mockDrawDetail })

    const { fetchDrawDetail } = useUserDraws()

    const result = await fetchDrawDetail('test-code')

    expect(api.get).toHaveBeenLastCalledWith('/api/v1/draws/test-code', { params: { inviteCode: 'test-code' } })
    expect(result).toEqual(mockDrawDetail)
  })

  it('should return null when fetchDrawDetail fails', async () => {
    const mockError = {
      response: {
        status: 404,
        data: { message: 'Not found' },
      },
    }

    ;(api.get as any).mockResolvedValueOnce({ data: [] })
    ;(api.get as any).mockRejectedValueOnce(mockError)

    const { fetchDrawDetail } = useUserDraws()

    const result = await fetchDrawDetail('missing')

    expect(result).toBeNull()
  })
})

