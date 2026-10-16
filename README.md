# BacFlow: Your Algerian Study Flow

Build a clean, modern, and high-energy progress tracking web app designed specifically for Algerian Baccalaureate (Bac Algérie) students ("BacFlow"). The app must feature a sleek, modern aesthetic with dark/light mode toggle, subtle glassmorphism (`backdrop-blur`), smooth Framer Motion animations, interactive micro-feedback (confetti on task complete), and vibrant accent colors (electric violet, cyan, mint green, and glowing orange).

--

### Core Structure & Functionality

#### 1. Algerian Bac Syllabus & Dual-Stream Progress System
- **Stream Switcher:** A smooth toggle on the user profile or header to switch between streams:
  1. **Experimental Sciences Stream (شعبة علوم تجريبية):**
     - Natural Sciences (علوم الطبيعة والحياة - Coeff 6)
     - Physics & Chemistry (العلوم الفيزيائية - Coeff 5)
     - Mathematics (الرياضيات - Coeff 5)
     - Arabic (اللغة العربية - Coeff 3)
     - History & Geography (التاريخ والجغرافيا - Coeff 2)
     - French (الفرنسية - Coeff 2)
     - English (الإنكليزية - Coeff 2)
     - Islamic Studies (التربية الإسلامية - Coeff 2)
     - Philosophy (الفلسفة - Coeff 2)
  2. **Mathematics Stream (شعبة رياضيات):**
     - Mathematics (الرياضيات - Coeff 7)
     - Physics & Chemistry (العلوم الفيزيائية - Coeff 6)
     - Natural Sciences (علوم الطبيعة والحياة - Coeff 2)
     - Arabic (اللغة العربية - Coeff 3)
     - History & Geography (التاريخ والجغرافيا - Coeff 2)
     - French (الفرنسية - Coeff 2)
     - English (الإنكليزية - Coeff 2)
     - Islamic Studies (التربية الإسلامية - Coeff 2)
     - Philosophy (الفلسفة - Coeff 2)

- **Unit & Content Hierarchy:** `Subject` > `Unit (الوحدة)` > `Lesson / Exercise / Summary / Past Paper (Bac Topics)`.
- **Completion Mechanics:** Ticking off a lesson or exercise automatically updates:
  1. Subject-specific progress percentage.
  2. Overall Bac completion percentage (weighted according to official subject coefficients for the chosen stream).

#### 2. Daily Streak & Gamified Motivation
- **Glowing Streak Badge:** A prominent daily study flame counter tracking consecutive days logged.
- **Countdown to Bac June Exam:** Live countdown timer to the exam date with dynamic, inspiring quotes in Arabic and English.
- **Daily Targets Widget:** Interactive daily goals (e.g., "Complete 2 Physics exercises & 1 Math unit summary today").
- **Study Heatmap:** A GitHub-style activity grid showing study consistency across the school year.

#### 3. Social Friends Feed & Cross-Stream Leaderboard
- **Friend Invites & Profiles:** Unique share links/codes to add classmates. Profiles show their stream (Science or Math), streak, and Bac completion status.
- **Live Leaderboard:** Real-time feed displaying friends' overall progress %, daily streaks, and recent milestone completions.
- **Peer Accountability:** Quick-reaction emojis (🔥, 👏, 📚, ⚡) and a "Nudge / Remind to Study" button to push inactive friends to study.

#### 4. Integrated Chat & Study Hub
- **Group & Direct Messaging:** Real-time chat interface for study groups and 1-on-1 classmate discussions.
- **Context Sharing:** Direct "Share to Chat" action from any subject unit or past paper exercise.
- **Attachment Support:** Rich text formatting, PDF attachment previewing, and quick image/voice note sharing.

#### 5. Embedded Focus Timer & Active Recall Tools
- **Pomodoro Timer:** Built-in customizable study clock (25/5 min) with lo-fi/ambient sound toggles.
- **Formula & Mistake Log Drawer:** Side sheet to quickly capture key formulas, definitions, or tricky exam mistakes during study sessions.

---

### UI & Aesthetics
- **Layout:** Floating glassmorphic sidebar/navigation bar using Lucide Icons.
- **Typography:** Modern, clean sans-serif with full bilingual support (Arabic & English text alignment).
- **Cards & Elements:** Rounded corners (`rounded-2xl`), frosted glass panels, glowing accent borders, and clean data tables for progress tracking.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ce978951-4c73-41c0-881e-721713ee6a9e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
