# 💊 Drug Quiz

An interactive pharmacology matching game for medical students — inspired by the [Amino Acid Quiz](https://apps.apple.com/us/app/amino-acid-quiz/id1301129866) app.

Match drug names to their class, primary use, key side effects, or main contraindications through rapid, visual matching rounds that make Step 1 pharmacology stick.

![Home Screen](https://github.com/user-attachments/assets/87c3e118-e00b-4a7d-904f-7b75e6a718ce)

## 📱 Using on iPhone (Free — No App Store Required)

Drug Quiz is a **Progressive Web App (PWA)**.  You can install it directly on your iPhone home screen for a full-screen, native-like experience — no App Store, no fees.

### Step 1 — Open in Safari

> **Important:** Use **Safari** on iOS. Chrome and Firefox on iOS do not support PWA installation.

Navigate to the live URL:

```
https://<your-github-username>.github.io/drugs-quiz/
```

### Step 2 — Add to Home Screen

1. Tap the **Share** button (box with upward arrow) at the bottom of Safari.
2. Scroll down and tap **"Add to Home Screen"**.
3. Give the app a name (default: *Drug Quiz*) and tap **Add**.

The app icon now appears on your home screen.  Open it and it runs full-screen, just like a native app — no browser chrome, no address bar.

### Step 3 — Keeping it up to date (periodic sync)

The app caches itself for offline use.  Whenever you push new quiz content or features to the `main` branch, GitHub Actions automatically rebuilds and redeploys the app.

To pick up the latest version on your iPhone:

- Open the app while connected to Wi-Fi or cellular data.
- An **"Update now"** banner will appear at the bottom of the screen when a new version is ready.
- Tap **Update now** — the page reloads with the fresh content.

That's it — no manual steps needed beyond opening the app.

---

## Features

- **Matching game** — two columns of tiles; click a drug name, then click its matching property
- **4 quiz modes** — Drug Class · Primary Use · Key Side Effect · Main Contraindication
- **Progress tracking** — accuracy %, matched/total counter, and a per-round progress bar
- **Result screen** — letter grade (A–F) with accuracy, correct/incorrect counts
- **Reference panel** — expandable drug list on the home screen for quick review
- **Custom CSV import** — load your own drug list; download a template to get started
- **Offline support** — the app works without an internet connection after the first load

## Built-in Drug Data (Step 1 Content)

### 🧠 Psychiatry Drugs (50 drugs)
SSRIs · MAOIs · TCAs · SNRIs · Atypical Antidepressants · Typical Antipsychotics · Atypical Antipsychotics · Mood Stabilizers · Benzodiazepines · Non-Benzo Hypnotics (Z-drugs) · Melatonin Agonists · ADHD Stimulants & Non-Stimulants · Alzheimer's Agents · Medication-Assisted Treatment (MAT)

### 🩸 Heme / Onc Drugs (47 drugs)
Alkylating Agents · Antimetabolites · Antitumor Antibiotics · Vinca Alkaloids · Taxanes · Topoisomerase Inhibitors · TKIs · Proteasome Inhibitors · IMiDs · Monoclonal Antibodies · Hormonal Agents · UFH / LMWH · DOACs · Antiplatelets · Thrombolytics · Hematopoietic Growth Factors · Iron Chelators

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Deploying to GitHub Pages

1. In your repository settings, go to **Pages → Source** and select **GitHub Actions**.
2. Push any change to the `main` branch (or trigger the workflow manually from the **Actions** tab).
3. GitHub Actions will build and deploy the app automatically.
4. Your app will be live at `https://<your-github-username>.github.io/drugs-quiz/`.

## Custom CSV Format

Upload a `.csv` file with the following columns (click **Download template** in the app):

| Column | Required | Description |
|---|---|---|
| `name` | ✅ | Drug name |
| `class` | ✅ | Drug class / category |
| `brandName` | — | Brand / trade name |
| `uses` | — | Indications |
| `sideEffects` | — | Key side effects |
| `contraindications` | — | Main contraindications |
| `mechanism` | — | Mechanism of action |

## Tech Stack

- **React 19** + **Vite 7** (no UI library dependencies)
- **vite-plugin-pwa** — service worker, web app manifest, offline caching
- **GitHub Actions** — CI/CD pipeline for zero-config deployment to GitHub Pages
- **Vitest** + **@testing-library/react** for unit tests
- Plain CSS with CSS Grid / Flexbox layout
