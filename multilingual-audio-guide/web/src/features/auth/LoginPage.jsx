import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { validateLoginInput } from '@shared/utils/validateLogin.js'
import { login } from '../../services/api'
import { selectIsAuthenticated, useAppStore } from '../../store/useAppStore'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'

export default function LoginPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const startSession = useAppStore((s) => s.startSession)
  const isAuthenticated = useAppStore(selectIsAuthenticated)

  const [form, setForm] = useState({ unfid: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setServerError(null)

    const { valid, errors, value } = validateLoginInput(form)
    setFieldErrors(errors)
    if (!valid) return

    setSubmitting(true)
    try {
      // Bước 1-2: gửi UNFID/Password, hệ thống trả tên + User Type và bắt đầu Session
      const session = await login(value)
      startSession(session)
      // Bước 4: chuyển tới trang Home
      navigate('/', { replace: true })
    } catch (err) {
      // E1 / E2: báo lỗi và giữ actor ở đầu luồng (form đăng nhập)
      setServerError(err.code)
      setForm((f) => ({ ...f, password: '' }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login">
      <form className="card login__card" onSubmit={onSubmit} noValidate>
        <div className="login__lang">
          {['vi', 'en'].map((lng) => (
            <button
              key={lng}
              type="button"
              className={i18n.language === lng ? 'lang lang--active' : 'lang'}
              onClick={() => i18n.changeLanguage(lng)}
            >
              {lng.toUpperCase()}
            </button>
          ))}
        </div>

        <h1>{t('login.title')}</h1>
        <p className="muted">{t('login.subtitle')}</p>

        {location.state?.timedOut && <p className="alert alert--info">{t('login.sessionExpired')}</p>}
        {serverError && (
          <p className="alert alert--error" role="alert">
            {t(`login.errors.${serverError}`)}
          </p>
        )}

        <label className="field">
          <span>{t('login.unfid')}</span>
          <input name="unfid" value={form.unfid} onChange={onChange} autoComplete="username" autoFocus />
          {fieldErrors.unfid && <small className="field__error">{t(`login.errors.${fieldErrors.unfid}`)}</small>}
        </label>

        <label className="field">
          <span>{t('login.password')}</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            autoComplete="current-password"
          />
          {fieldErrors.password && (
            <small className="field__error">{t(`login.errors.${fieldErrors.password}`)}</small>
          )}
        </label>

        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader label={t('login.submitting')} /> : t('login.submit')}
        </Button>
      </form>
    </main>
  )
}
