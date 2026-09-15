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
├── web/                          
│   ├── public/
│   ├── src/
│   │   ├── assets/                
│   │   ├── components/
│   │   │   ├── common/            
│   │   │   ├── upload/            
│   │   │   └── player/            
│   │   ├── pages/                 
│   │   ├── hooks/                 
│   │   ├── services/             
│   │   ├── store/                 
│   │   ├── i18n/             
│   │   ├── router/           
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
├── mobile/                    
│   ├── app/              
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── i18n/
│   ├── assets/
│   ├── app.json
│   └── package.json
│
├── shared/                     
│   ├── types/                
│   ├── constants/                
│   ├── utils/                 
│   └── api/                   
│
├── functions/                 
│   ├── src/
│   │   ├── index.ts
│   │   ├── handlers/           
│   │   ├── services/             
│   │   └── config/
│   └── package.json
│
├── docs/                        
│   ├── prd.md                   
│   ├── architecture.md          
│   ├── api-contract.md        
│   └── demo-script.md         
│
├── .github/
│   └── workflows/
│       └── ci.yml          
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



