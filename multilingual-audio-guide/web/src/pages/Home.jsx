import { useTranslation } from 'react-i18next'
import { FEATURES } from '@shared/constants/roles.js'
import { useAppStore } from '../store/useAppStore'
import Button from '../components/common/Button'

// UC8 bước 3-4: Home hiển thị chức năng theo User Type của người đăng nhập.
export default function Home({ onLogOff }) {
  const { t } = useTranslation()
  const session = useAppStore((s) => s.session)
  const { user, features } = session
  const menuFeatures = features.filter((f) => f !== FEATURES.LOG_OFF)

  return (
    <main className="home">
      <header className="home__header">
        <div>
          <h1>{t('home.welcome', { name: user.name })}</h1>
          <p className="muted">
            {t('home.userType')}: <strong>{t(`userTypes.${user.userType}`)}</strong> · {user.unfid}
          </p>
        </div>
        {features.includes(FEATURES.LOG_OFF) && (
          <Button variant="secondary" onClick={onLogOff}>
            {t('features.LOG_OFF')}
          </Button>
        )}
      </header>

      <h2>{t('home.features')}</h2>
      <ul className="feature-grid">
        {menuFeatures.map((f) => (
          <li key={f} className="card feature">
            {t(`features.${f}`)}
          </li>
        ))}
      </ul>
    </main>
  )
}
