import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// Session lưu trong sessionStorage: đóng tab là mất phiên, phù hợp cổng quản trị.
export const useAppStore = create(
  persist(
    (set) => ({
      session: null, // { token, expiresAt, user: { unfid, name, userType }, features: [] }
      lastActivityAt: Date.now(),
      startSession: (session) => set({ session, lastActivityAt: Date.now() }),
      touch: () => set({ lastActivityAt: Date.now() }),
      logout: () => set({ session: null }), // "Log Off"
    }),
    {
      name: 'mag-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ session: state.session, lastActivityAt: state.lastActivityAt }),
    },
  ),
)

export const selectIsAuthenticated = (state) =>
  Boolean(state.session) && state.session.expiresAt > Date.now()
