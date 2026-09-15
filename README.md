# Multilingual Automatic Audio/Video Narration System

An application that automatically generates multilingual narration for audio/video content. The system transcribes speech from the source file, translates it into a target language, and synthesizes a new narration track, with synchronized bilingual subtitles.

## Tech Stack

- **Web:** React.js (Vite)
- **Mobile:** React Native (Expo)
- **Backend:** Firebase / Supabase (minimal backend layer for auth, storage, and orchestration)
- **AI Services:** OpenAI Whisper (Speech-to-Text), Google Translate / DeepL (Translation), Google Cloud TTS / Azure Speech (Text-to-Speech)
- **CI:** GitHub Actions (lint, type-check, build verification)

## Project Structure

```
multilingual-narration/
├── web/                          # React.js web application
│   ├── public/
│   ├── src/
│   │   ├── assets/                # images, icons, fonts
│   │   ├── components/
│   │   │   ├── common/            # reusable UI elements (Button, Loader, Modal)
│   │   │   ├── upload/            # UploadForm, ProgressBar
│   │   │   └── player/            # AudioPlayer, SubtitleOverlay, LanguageSwitcher
│   │   ├── pages/                 # route-level pages (Home, Upload, Result, History)
│   │   ├── hooks/                 # custom hooks (useUploadFile, usePollingStatus)
│   │   ├── services/              # API calls to backend
│   │   ├── store/                 # global state (Zustand / Redux Toolkit)
│   │   ├── i18n/                  # UI localization (react-i18next)
│   │   ├── router/                # route configuration
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
├── mobile/                       # React Native (Expo) application
│   ├── app/                       # screens (Expo Router)
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── i18n/
│   ├── assets/
│   ├── app.json
│   └── package.json
│
├── shared/                       # code shared between web and mobile
│   ├── types/                     # TypeScript types/interfaces
│   ├── constants/                 # supported languages, error codes, config
│   ├── utils/                     # pure helper functions
│   └── api/                       # endpoint definitions and request/response contracts
│
├── functions/                    # minimal backend layer
│   ├── src/
│   │   ├── index.ts
│   │   ├── handlers/              # uploadHandler, transcribeHandler, translateHandler, ttsHandler
│   │   ├── services/               # third-party API wrappers
│   │   └── config/
│   └── package.json
│
├── docs/                         # project documentation
│   ├── prd.md                     # product requirements
│   ├── architecture.md            # system architecture and data flow
│   ├── api-contract.md            # API request/response contracts
│   └── demo-script.md             # demo walkthrough script
│
├── .github/
│   └── workflows/
│       └── ci.yml                 # lint, type-check, build check
│
├── .gitignore
└── README.md
```

## Folder Overview

| Folder | Purpose |
|---|---|
| web/ | Web frontend built with React.js, owned by the Web FE developer |
| mobile/ | Mobile frontend built with React Native (Expo), owned by the Mobile FE developer |
| shared/ | Types, constants, and API contracts shared across web and mobile to avoid duplication and drift |
| functions/ | Thin backend layer that calls third-party AI services (STT, translation, TTS) and returns results |
| docs/ | All project documentation, kept up to date throughout development |
| .github/workflows/ | Continuous integration pipeline, runs on every pull request |


