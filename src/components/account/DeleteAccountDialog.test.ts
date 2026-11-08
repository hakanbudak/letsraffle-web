import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'

// A plain function instead of vi.fn(): vi.fn tracks returned promises and reports
// a rejection as unhandled even when the component catches it.
const api = vi.hoisted(() => ({
  calls: [] as string[],
  impl: (_url: string): Promise<unknown> => Promise.resolve({ status: 204 }),
}))
vi.mock('@/services/api', () => ({
  default: {
    delete: (url: string) => {
      api.calls.push(url)
      return api.impl(url)
    },
  },
}))

import DeleteAccountDialog from './DeleteAccountDialog.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      account: {
        delete: {
          title: 'Delete your account',
          body: 'This cannot be undone.',
          draws: 'Draws stay.',
          confirm: 'Permanently delete my account',
          deleting: 'Deleting...',
          cancel: 'Cancel',
          failed: 'Your account could not be deleted, please try again.',
        },
      },
    },
  },
})

const mountDialog = () => mount(DeleteAccountDialog, { props: { visible: true }, global: { plugins: [i18n] } })

describe('DeleteAccountDialog', () => {
  beforeEach(() => {
    api.calls = []
    api.impl = () => Promise.resolve({ status: 204 })
  })

  it('renders nothing when hidden', () => {
    const wrapper = mount(DeleteAccountDialog, { props: { visible: false }, global: { plugins: [i18n] } })
    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(false)
  })

  it('deletes the account and emits deleted', async () => {
    const wrapper = mountDialog()

    await wrapper.get('[data-testid="confirm-delete"]').trigger('click')
    await flushPromises()

    expect(api.calls).toEqual(['/api/v1/auth/me'])
    expect(wrapper.emitted('deleted')).toHaveLength(1)
  })

  it('shows an error and stays open when deletion fails', async () => {
    api.impl = () => Promise.reject(new Error('500'))
    const wrapper = mountDialog()

    await wrapper.get('[data-testid="confirm-delete"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('could not be deleted')
    expect(wrapper.emitted('deleted')).toBeUndefined()
  })

  it('emits close on cancel without calling the API', async () => {
    const wrapper = mountDialog()
    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(api.calls).toEqual([])
  })
})
