export default function Loader({ label }) {
  return (
    <span className="loader" role="status" aria-live="polite">
      <span className="loader__spinner" aria-hidden="true" />
      {label}
    </span>
  )
}
