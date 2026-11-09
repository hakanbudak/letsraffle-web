import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'

const post = vi.fn()
vi.mock('@/services/api', () => ({ default: { post: (...args: unknown[]) => post(...args), defaults: { headers: { common: {} } } } }))
vi.mock('@/router', () => ({ router: { currentRoute: { value: { path: '/' } }, push: vi.fn(), replace: vi.fn() } }))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      auth: {
        social: {
          or: 'or',
          apple: 'Continue with Apple',
          google: 'Continue with Google',
          soon: 'This sign-in option is coming soon.',
          failed: 'Sign-in could not be completed, please try again.',
        },
      },
    },
  },
})

const authResponse = {
  access_token: 'access',
  refresh_token: 'refresh',
  token_type: 'bearer',
  user: { id: 1, email: 'ayse@example.com' },
}

async function mountWith(env: Record<string, string>) {
  vi.resetModules()
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value)
  const { default: SocialLogin } = await import('./SocialLogin.vue')
  return mount(SocialLogin, { global: { plugins: [i18n] } })
}

describe('SocialLogin', () => {
  beforeEach(() => {
    post.mockReset()
    localStorage.clear()
    // Pretend every provider script loads instantly.
    vi.spyOn(document.head, 'appendChild').mockImplementation((el: Node) => {
      queueMicrotask(() => (el as HTMLScriptElement).onload?.(new Event('load')))
      return el
    })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    delete window.AppleID
    delete window.google
  })

  it('shows the coming-soon notice when providers are not configured', async () => {
    const wrapper = await mountWith({ VITE_APPLE_SERVICES_ID: '', VITE_GOOGLE_CLIENT_ID: '' })

    await wrapper.get('[data-testid="apple-signin"]').trigger('click')
    expect(wrapper.text()).toContain('This sign-in option is coming soon.')
    expect(wrapper.find('[data-testid="google-soon"]').exists()).toBe(true)
    expect(post).not.toHaveBeenCalled()
  })

  it('exchanges the Apple identity token and emits success', async () => {
    const init = vi.fn()
    window.AppleID = {
      auth: {
        init,
        signIn: vi.fn().mockResolvedValue({
          authorization: { id_token: 'apple-id-token' },
          user: { name: { firstName: 'Ayşe', lastName: 'Yılmaz' } },
        }),
      },
    }
    post.mockResolvedValue({ data: authResponse })
    const wrapper = await mountWith({ VITE_APPLE_SERVICES_ID: 'com.letsraffle.web', VITE_GOOGLE_CLIENT_ID: '' })

    await wrapper.get('[data-testid="apple-signin"]').trigger('click')
    await flushPromises()

    expect(init).toHaveBeenCalledWith(expect.objectContaining({ clientId: 'com.letsraffle.web', usePopup: true }))
    expect(post).toHaveBeenCalledWith('/api/v1/auth/apple', {
      identity_token: 'apple-id-token',
      first_name: 'Ayşe',
      last_name: 'Yılmaz',
    })
    expect(localStorage.getItem('santas_draw_access_token')).toBe('access')
    expect(wrapper.emitted('success')).toHaveLength(1)
  })

  it('stays quiet when the user closes the Apple popup', async () => {
    window.AppleID = { auth: { init: vi.fn(), signIn: vi.fn().mockRejectedValue({ error: 'popup_closed_by_user' }) } }
    const wrapper = await mountWith({ VITE_APPLE_SERVICES_ID: 'com.letsraffle.web', VITE_GOOGLE_CLIENT_ID: '' })

    await wrapper.get('[data-testid="apple-signin"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(wrapper.emitted('success')).toBeUndefined()
  })

  it('renders the Google button and exchanges its credential', async () => {
    let callback: ((r: { credential: string }) => void) | undefined
    const renderButton = vi.fn()
    window.google = {
      accounts: {
        id: {
          initialize: vi.fn((config) => { callback = config.callback }),
          renderButton,
        },
      },
    }
    post.mockResolvedValue({ data: authResponse })
    const wrapper = await mountWith({ VITE_APPLE_SERVICES_ID: '', VITE_GOOGLE_CLIENT_ID: 'web-client.apps.googleusercontent.com' })
    await flushPromises()

    expect(renderButton).toHaveBeenCalledWith(
      wrapper.get('[data-testid="google-signin"]').element,
      expect.objectContaining({ text: 'continue_with', locale: 'en' }),
    )

    callback!({ credential: 'google-credential' })
    await flushPromises()

    expect(post).toHaveBeenCalledWith('/api/v1/auth/google', { credential: 'google-credential' })
    expect(wrapper.emitted('success')).toHaveLength(1)
  })

  it('shows the backend error when the token is rejected', async () => {
    window.AppleID = { auth: { init: vi.fn(), signIn: vi.fn().mockResolvedValue({ authorization: { id_token: 't' } }) } }
    post.mockRejectedValue(Object.assign(new Error('401'), {
      isAxiosError: true,
      response: { status: 401, data: { detail: 'Invalid Apple identity token' } },
    }))
    const wrapper = await mountWith({ VITE_APPLE_SERVICES_ID: 'com.letsraffle.web', VITE_GOOGLE_CLIENT_ID: '' })

    await wrapper.get('[data-testid="apple-signin"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Invalid Apple identity token')
    expect(wrapper.emitted('success')).toBeUndefined()
  })
})
