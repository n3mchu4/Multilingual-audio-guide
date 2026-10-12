# Database and Storage setup

The app stores media in Storage and stores only public URLs in PostgreSQL. Do not put PostgreSQL credentials or a Storage service-role key in the web or mobile app.

## Start the connected app locally

1. Keep the existing PostgreSQL settings in `db/.env`. The backend reads this file; the browser and mobile app never connect to PostgreSQL directly.
2. Set a private `AUTH_SECRET` in `db/.env` (use at least 32 random bytes). The fallback secret is for local development only.
3. Start the API from the project root with `npm run dev:api`. It listens on port `3002` by default.
4. In a second terminal, run `npm run dev` for the Vite web app. Its `/api` and `/media` requests are proxied to the PostgreSQL API.
5. To use the Expo app on a physical phone, set `EXPO_PUBLIC_GUIDE_API_URL` to `http://<computer-LAN-IP>:3002` in `mobile/.env`. `localhost` is appropriate only when the app and API run on the same device.

The public read endpoints are `GET /api/landmarks?lang=vi|en` and `GET /api/landmarks/{landmark-id}?lang=vi|en`. The admin portal reads and writes PostgreSQL through authenticated `/api/admin/*` endpoints.

## Where to add Storage URLs

The current database already has these media columns:

| Media | PostgreSQL field | Storage key example |
|---|---|---|
| Cover image | `landmarks.background_image_url` | `images/ben-thanh-market/cover.jpg` |
| Vietnamese narration | `landmarks.audio_vi_url` | `audio/ben-thanh-market/vi.mp3` |
| English narration | `landmarks.audio_en_url` | `audio/ben-thanh-market/en.mp3` |
| Gallery image | `landmark_images.image_url` | `images/ben-thanh-market/market-interior.jpg` |

For local files, put them under `db/storage/images/` or `db/storage/audio/`, then save a key using the database helper:

```powershell
npm --prefix db run set:media -- ben-thanh-market background images/ben-thanh-market/cover.jpg
npm --prefix db run set:media -- ben-thanh-market audio-vi audio/ben-thanh-market/vi.mp3
npm --prefix db run set:media -- ben-thanh-market audio-en audio/ben-thanh-market/en.mp3
npm --prefix db run set:media -- ben-thanh-market gallery images/ben-thanh-market/market-interior.jpg
```

For an already-uploaded cloud object, pass its public HTTPS URL instead of a storage key:

```powershell
npm --prefix db run set:media -- ben-thanh-market audio-vi https://<storage-host>/<bucket>/audio/ben-thanh-market/vi.mp3
```

When using cloud storage, set `STORAGE_MODE=cloud` and `STORAGE_PUBLIC_BASE_URL` in `db/.env`. For Supabase public objects, that base is typically `https://<project>.supabase.co/storage/v1/object/public`; the bucket and object path are then appended by the helper. Keep the bucket public or use an authenticated/signed-URL design before using private objects; this app currently stores public URLs.

`npm --prefix db run set:media` updates the corresponding row in PostgreSQL. You can also set these URL fields directly in a SQL client. The public website and mobile app read the saved URLs from the API; no image or audio files are uploaded by the app.

## First administrator

The current database has no user records. Create the first super-admin once, using a password supplied only in the current PowerShell process:

```powershell
$env:BOOTSTRAP_ADMIN_PASSWORD = Read-Host "Admin password"
npm --prefix db run create:admin -- admin
Remove-Item Env:BOOTSTRAP_ADMIN_PASSWORD
```

Use a password of at least 10 characters. The account is stored with a bcrypt hash. Do not use the development credentials shown in the old login prototype.
