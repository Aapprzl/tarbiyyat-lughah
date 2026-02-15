# Tarbiyyat-Lughah - Platform Pembelajaran Bahasa Arab Interaktif

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.95.3-3ECF8E?logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

> Platform pembelajaran bahasa Arab modern dengan 14+ game interaktif, materi terstruktur, dan pengalaman belajar yang menyenangkan.

---

## 📚 Tentang Proyek

**Tarbiyyat-Lughah** adalah platform pembelajaran bahasa Arab berbasis web yang dirancang untuk membuat proses belajar bahasa Arab menjadi lebih interaktif, menyenangkan, dan efektif. Platform ini menggabungkan materi pembelajaran terstruktur dengan berbagai permainan edukatif yang membantu siswa menguasai kosakata, tata bahasa, dan keterampilan bahasa Arab lainnya.

### ✨ Fitur Utama

- **📖 Materi Pembelajaran Terstruktur**
  - Kurikulum berbasis program dan topik
  - Rich text editor dengan dukungan bahasa Arab
  - Mind map interaktif untuk visualisasi konsep
  - Integrasi multimedia (video, audio, PDF, gambar)

- **🎮 14+ Game Interaktif**
  - Match-Up: Mencocokkan kata dengan artinya
  - Quiz: Kuis pilihan ganda
  - Anagram: Menyusun huruf acak
  - Complete Sentence: Melengkapi kalimat
  - Unjumble: Menyusun kata menjadi kalimat
  - Spin Wheel: Roda putar kosakata
  - Word Classification: Klasifikasi kata
  - Harakat: Latihan tanda baca Arab
  - Memory: Permainan memori
  - Hangman: Tebak kata
  - Word Detective: Mencari kata tersembunyi
  - Camel Race: Balapan unta dengan kuis
  - Word Rain: Menangkap kata yang jatuh
  - Interactive Story: Cerita interaktif dengan pilihan

- **👨‍🏫 Panel Admin Lengkap**
  - Editor materi dengan block-based system
  - Manajemen program dan topik
  - Upload dan manajemen aset (gambar, audio, video, PDF)
  - Kustomisasi tema dan font
  - Analytics dan tracking

- **🌙 Pengalaman Pengguna Modern**
  - Dark mode support
  - Responsive design (mobile-first)
  - PWA (Progressive Web App) - bisa diinstall
  - Animasi smooth dengan Framer Motion
  - Font Arab yang indah dan mudah dibaca

---

## 🛠️ Tech Stack

### Frontend

- **React 19.2.0** - UI library
- **Vite 7.2.4** - Build tool & dev server
- **React Router 7.13.0** - Routing
- **TailwindCSS 3.4.17** - Styling
- **Framer Motion 12.31.0** - Animations
- **Lucide React 0.563.0** - Icons

### Backend & Database

- **Supabase 2.95.3** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Storage
  - Realtime subscriptions

### Additional Libraries

- **DOMPurify 3.3.1** - XSS protection
- **React Markdown 9.0.1** - Markdown rendering
- **Canvas Confetti 1.9.3** - Celebration effects
- **React GA4 2.1.0** - Google Analytics

---

## 📋 Prerequisites

Sebelum memulai, pastikan Anda telah menginstall:

- **Node.js** (v18 atau lebih baru)
- **npm** atau **yarn** atau **pnpm**
- **Git**

---

## 🚀 Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/tarbiyyat-lughah.git
cd tarbiyyat-lughah
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
# atau
pnpm install
```

### 3. Environment Variables

Buat file `.env` di root project dan tambahkan konfigurasi Supabase Anda:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **⚠️ PENTING:** Jangan commit file `.env` ke Git! File ini sudah ada di `.gitignore`.

**Cara mendapatkan credentials Supabase:**

1. Buat akun di [Supabase](https://supabase.com/)
2. Buat project baru
3. Buka **Settings** → **API**
4. Copy **Project URL** dan **anon/public key**

### 4. Database Setup

Jalankan migration SQL di Supabase SQL Editor:

```sql
-- Buat tabel programs
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  order_index INTEGER DEFAULT 0,
  type TEXT DEFAULT 'curriculum',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat tabel topics
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  thumbnail TEXT,
  order_index INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat tabel stages
CREATE TABLE stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat tabel blocks
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stage_id UUID REFERENCES stages(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  data JSONB,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat tabel game_categories
CREATE TABLE game_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat tabel blocks_game
CREATE TABLE blocks_game (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES game_categories(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT,
  thumbnail TEXT,
  data JSONB,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat storage bucket untuk konten
INSERT INTO storage.buckets (id, name, public) VALUES ('content', 'content', true);
```

### 5. Run Development Server

```bash
npm run dev
```

Buka browser dan akses `http://localhost:5173`

---

## 📁 Project Structure

```
tarbiyyat-lughah/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── admin/         # Admin panel components
│   │   │   ├── blocks/    # Block editor components
│   │   │   │   ├── common/      # Common blocks (Text, Vocab, etc.)
│   │   │   │   └── games/       # Game block editors
│   │   │   └── ...
│   │   ├── animations/    # Reusable animations
│   │   ├── features/      # Feature-specific components
│   │   ├── games/         # 14 game components
│   │   ├── layout/        # Layout components (Header, Footer, etc.)
│   │   ├── media/         # Media viewers (PDF, Audio, Image)
│   │   ├── providers/     # Context providers (Theme, Font, Audio)
│   │   └── ui/            # UI utilities (Analytics, PWA, etc.)
│   ├── pages/             # Page components
│   │   ├── admin/         # Admin pages
│   │   └── ...            # Public pages
│   ├── services/          # Business logic & API calls
│   │   ├── features/      # Feature-specific services
│   │   ├── authService.js
│   │   ├── contentService.js
│   │   ├── storageService.js
│   │   └── ...
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── data/              # Static data
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── .env                   # Environment variables (gitignored)
├── .gitignore
├── package.json
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
└── README.md
```

---

## 🎨 Development Guide

### Adding a New Game

1. Create game component in `src/components/games/`:

```jsx
// src/components/games/MyNewGame.jsx
import React from "react";

const MyNewGame = ({ data }) => {
  // Game logic here
  return <div>My New Game</div>;
};

export default MyNewGame;
```

2. Add game editor in `src/components/admin/blocks/games/`:

```jsx
// src/components/admin/blocks/games/MyNewGameEditor.jsx
export const MyNewGameEditor = ({ block, onUpdate }) => {
  // Editor logic here
};
```

3. Register in `GameBlockEditor.jsx` and `MaterialDetail.jsx`

### Styling Guidelines

- Use TailwindCSS utility classes
- Follow existing color scheme (teal primary)
- Support dark mode with `dark:` variants
- Use `arabic-content` class for Arabic text
- Maintain responsive design (mobile-first)

### Code Quality

- Run linter before commit: `npm run lint`
- Keep components under 500 lines
- Extract reusable logic to hooks/utils
- Add comments for complex logic
- Use TypeScript types (future migration)

---

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

Output akan ada di folder `dist/`.

### Deploy to Vercel

1. Push code ke GitHub
2. Import project di [Vercel](https://vercel.com/)
3. Add environment variables di Vercel dashboard
4. Deploy!

### Deploy to Netlify

1. Build project: `npm run build`
2. Drag & drop folder `dist/` ke [Netlify Drop](https://app.netlify.com/drop)
3. Configure environment variables di Netlify dashboard

### PWA Installation

Setelah deploy, users bisa install app:

- **Desktop:** Click install icon di address bar
- **Mobile:** Tap "Add to Home Screen" di browser menu

---

## 🔒 Security

- ✅ XSS protection dengan DOMPurify
- ✅ Environment variables untuk credentials
- ✅ Supabase Row Level Security (RLS)
- ✅ HTTPS only in production
- ⚠️ Pastikan `.env` tidak ter-commit

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Authors

- **Your Name** - _Initial work_

---

## 🙏 Acknowledgments

- React team for amazing framework
- Supabase for backend infrastructure
- TailwindCSS for utility-first CSS
- Lucide for beautiful icons
- All contributors and users

---

## 📞 Support

Jika ada pertanyaan atau masalah:

- Open an issue di GitHub
- Email: your.email@example.com
- Discord: [Your Discord Server]

---

**Made with ❤️ for Arabic learners**
