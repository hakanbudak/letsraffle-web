import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DrawSuccessModal from './DrawSuccessModal.vue'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      modals: {
        successTitle: 'Congrats!',
        successMessage: 'You successfully completed the draw! 🎁',
        successFooter: 'Happy Holidays! 🎄',
        close: 'Got it',
      },
    },
  },
})

describe('DrawSuccessModal', () => {
  it('should not render when visible is false', () => {
    const wrapper = mount(DrawSuccessModal, {
      props: {
        visible: false,
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.find('.fixed').exists()).toBe(false)
  })

  it('should render when visible is true', () => {
    const wrapper = mount(DrawSuccessModal, {
      props: {
        visible: true,
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.find('.fixed').exists()).toBe(true)
    expect(wrapper.text()).toContain('Congrats!')
  })

  it('should display custom title when provided', () => {
    const wrapper = mount(DrawSuccessModal, {
      props: {
        visible: true,
        title: 'Custom Title',
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Custom Title')
  })

  it('should display custom message when provided', () => {
    const wrapper = mount(DrawSuccessModal, {
      props: {
        visible: true,
        message: 'Custom message',
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Custom message')
  })

  it('should display additional message when provided', () => {
    const wrapper = mount(DrawSuccessModal, {
      props: {
        visible: true,
        additionalMessage: 'Additional info',
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Additional info')
  })

  it('should display custom footer text when provided', () => {
    const wrapper = mount(DrawSuccessModal, {
      props: {
        visible: true,
        footerText: 'Custom footer',
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Custom footer')
  })

  it('should emit close event when clicking overlay', async () => {
    const wrapper = mount(DrawSuccessModal, {
      props: {
        visible: true,
      },
      global: {
        plugins: [i18n],
      },
    })

    const overlay = wrapper.find('.fixed')
    await overlay.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should emit close event when clicking close button', async () => {
    const wrapper = mount(DrawSuccessModal, {
      props: {
        visible: true,
      },
      global: {
        plugins: [i18n],
      },
    })

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should not emit close when clicking modal content', async () => {
    const wrapper = mount(DrawSuccessModal, {
      props: {
        visible: true,
      },
      global: {
        plugins: [i18n],
      },
    })

    const modalContent = wrapper.find('.bg-white')
    await modalContent.trigger('click')

    // Should not emit close because of @click.stop
    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('should use default translations when props are not provided', () => {
    const wrapper = mount(DrawSuccessModal, {
      props: {
        visible: true,
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Congrats!')
    expect(wrapper.text()).toContain('You successfully completed the draw! 🎁')
    expect(wrapper.text()).toContain('Happy Holidays! 🎄')
    expect(wrapper.text()).toContain('Got it')
  })
})

