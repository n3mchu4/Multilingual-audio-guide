import { Link } from 'react-router-dom'

export default function PlaceCard({ place }) {
  return (
    <article
      style={{
        border: '1px solid #ddd',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {place.background_image_url && (
        <img
          src={place.background_image_url}
          alt={place.title}
          loading="lazy"
          style={{
            width: '100%',
            height: 200,
            objectFit: 'cover',
            display: 'block',
          }}
        />
      )}

      <div style={{ padding: 16 }}>
        <h2>{place.title}</h2>

        {place.subtitle && <p>{place.subtitle}</p>}

        {place.description &&
          place.description !== 'Nội dung mẫu.' && (
            <p>{place.description}</p>
          )}

        <p>
          {place.audio_url
            ? 'Có audio tiếng Việt'
            : 'Audio đang được bổ sung'}
        </p>

        <Link to={`/places/${encodeURIComponent(place.id)}`}>
          Xem và nghe thuyết minh
        </Link>
      </div>
    </article>
  )
}