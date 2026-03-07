# 💊 Drug Quiz

An interactive pharmacology matching game for medical students — inspired by the [Amino Acid Quiz](https://apps.apple.com/us/app/amino-acid-quiz/id1301129866) app.

Match drug names to their class, primary use, key side effects, or main contraindications through rapid, visual matching rounds that make Step 1 pharmacology stick.

![Home Screen](https://github.com/user-attachments/assets/87c3e118-e00b-4a7d-904f-7b75e6a718ce)

## Features

- **Matching game** — two columns of tiles; click a drug name, then click its matching property
- **4 quiz modes** — Drug Class · Primary Use · Key Side Effect · Main Contraindication
- **Progress tracking** — accuracy %, matched/total counter, and a per-round progress bar
- **Result screen** — letter grade (A–F) with accuracy, correct/incorrect counts
- **Reference panel** — expandable drug list on the home screen for quick review
- **Custom CSV import** — load your own drug list; download a template to get started

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
- **Vitest** + **@testing-library/react** for unit tests
- Plain CSS with CSS Grid / Flexbox layout
