import { useEffect } from 'react'
import { SESSION_IDLE_TIMEOUT_MS } from '@shared/constants/auth.js'
import { useAppStore } from '../store/useAppStore'

// Trigger của UC8: phiên hết hạn do không hoạt động -> tự Log Off, quay lại trang Login.
export default function useIdleLogout(onTimeout) {
  const touch = useAppStore((s) => s.touch)

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'touchstart']
    const onActivity = () => touch()
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }))

    const timer = setInterval(() => {
      const { lastActivityAt, session } = useAppStore.getState()
      const expired = session && session.expiresAt <= Date.now()
      if (expired || Date.now() - lastActivityAt >= SESSION_IDLE_TIMEOUT_MS) onTimeout()
    }, 15_000)

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity))
      clearInterval(timer)
    }
  }, [touch, onTimeout])
}
