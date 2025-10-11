import { defineStore } from 'pinia'

interface PrivacyState {
  bannerDismissed: boolean
}

export const usePrivacyStore = defineStore('privacy', {
  state: (): PrivacyState => ({
    bannerDismissed: false
  }),

  actions: {
    init() {
      if (import.meta.client && typeof localStorage !== 'undefined') {
        const dismissed = localStorage.getItem('privacy_banner_dismissed')
        this.bannerDismissed = dismissed === 'true'
      }
    },

    dismissBanner() {
      this.bannerDismissed = true
      if (import.meta.client && typeof localStorage !== 'undefined') {
        localStorage.setItem('privacy_banner_dismissed', 'true')
      }
    }
  }
})
