# Data Guide

Everything the quiz knows lives in `src/data/topics/`. One JSON file per subject.
Edit those files directly — nothing else needs to change.

There are **two entity kinds**. A topic file declares which one it is with
`kind`, and that determines the field names, the quiz modes, and which array
holds the items:

| | `kind: "drug"` (the default) | `kind: "pathogen"` |
|---|---|---|
| items array | `drugs` | `organisms` |
| grouping field | `drugClass` | `category` |
| quiz modes | 7 (drug attributes) | 7 (organism attributes) |

---

## Where things are

```
src/data/topics/
  index.js              ← auto-discovers every .json here (don't edit for content)

  cardiology.json          ┐
  pulmonology.json         │
  neurology.json           │
  psychiatry.json          │
  infectious-disease.json  │
  endocrine.json           ├─ kind: "drug"
  gastrointestinal.json    │
  renal.json               │
  heme-onc.json            │
  rheum-immuno.json        │
  toxicology.json          ┘

  bacteriology.json        ┐
  virology.json            ├─ kind: "pathogen"
  mycology.json            │
  parasitology.json        ┘
```

Current totals: **602 items across 15 topics — 457 drugs and 145 organisms.**

---

## File shape

```json
{
  "id": "pulmonology",
  "label": "Pulmonology",
  "icon": "🫁",
  "blurb": "Asthma, COPD, pulmonary hypertension, fibrosis, antihistamines",
  "drugs": [ { ...drug... }, { ...drug... } ]
}
```

| Field   | Required | Notes |
|---------|----------|-------|
| `id`    | yes | Must match the filename without `.json` |
| `label` | yes | Shown on the topic card and header |
| `icon`  | yes | One emoji for the topic card |
| `blurb` | no  | One line under the topic name |
| `drugs` | yes | Array of drug objects |

---

## Drug shape

Every field below is required except `topicTags`.

```json
{
  "id": "albuterol",
  "name": "Albuterol",
  "emoji": "🫁💨⚡",
  "drugClass": "Short-Acting Beta-2 Agonist (SABA)",
  "primaryEffect": "Rapid bronchodilation within minutes",
  "treatmentUsage": "Acute asthma exacerbation, rescue therapy, ...",
  "mechanismOfAction": "Selectively stimulates beta-2 adrenergic receptors ...",
  "sideEffects": "Tremor, tachycardia, palpitations, hypokalemia, ...",
  "contraindications": "Hypersensitivity; use with caution in tachyarrhythmias",
  "topicTags": ["asthma", "COPD", "bronchodilation"],
  "tooltip": "The rescue inhaler. Beta-2 agonist causing bronchodilation ..."
}
```

| Field | What it's for |
|-------|---------------|
| `id` | Internal key. Lowercase, hyphenated, unique within the file. Reusing an id across topics is fine. |
| `name` | Displayed name. Unique within the file. |
| `emoji` | Three emoji as a visual mnemonic. Shown on question and result cards. |
| `drugClass` | Also a quiz answer. Colors are assigned automatically — you never pick one. |
| `primaryEffect` | One line: what it does physiologically. |
| `treatmentUsage` | Comma-separated indications. |
| `mechanismOfAction` | Full sentence. Aim for 15–35 words. |
| `sideEffects` | Comma-separated. Put the high-yield ones first. |
| `contraindications` | Comma-separated. |
| `topicTags` | Powers the "By Topic" filter. Lowercase except proper nouns. |
| `tooltip` | The teaching note shown after answering and on the results tiles. Under 60 words. |

**The seven quizzable fields** are `name`, `drugClass`, `primaryEffect`,
`treatmentUsage`, `mechanismOfAction`, `sideEffects`, and `contraindications`.
Any of them can be the question or the answer, as long as one side is `name`.

---

## Pathogen shape (`kind: "pathogen"`)

Every field below is required except `topicTags`.

```json
{
  "id": "staph-aureus",
  "name": "Staphylococcus aureus",
  "emoji": "🍇🟣🟡",
  "category": "Gram-Positive Cocci",
  "labFeatures": "Gram-positive cocci in grape-like clusters, catalase positive, coagulase positive, beta-hemolytic, ferments mannitol",
  "manifestations": "Skin and soft tissue abscess, acute endocarditis, osteomyelitis, toxic shock syndrome, rapid-onset food poisoning",
  "treatment": "Nafcillin or oxacillin for MSSA; vancomycin for MRSA",
  "transmission": "Direct contact and nasal carriage; preformed toxin in mayonnaise and custard for food poisoning",
  "virulenceFactor": "Protein A binds IgG Fc to block opsonization; TSST-1 superantigen cross-links MHC II and TCR",
  "topicTags": ["gram-positive", "cocci", "coagulase positive", "endocarditis"],
  "tooltip": "Coagulase positive separates it from all other staph. Protein A is the classic virulence factor."
}
```

| Field | What it's for |
|-------|---------------|
| `id` | Internal key. Lowercase, hyphenated, unique within the file. |
| `name` | Displayed name. Use the full binomial. Unique within the file. |
| `emoji` | Three emoji as a visual mnemonic. |
| `category` | Also a quiz answer, and what color-codes the result tiles. Colors are automatic. |
| `labFeatures` | Gram stain, morphology, catalase, coagulase, hemolysis, lactose, oxidase, urease, growth temperature, special media, stains. |
| `manifestations` | The clinical syndromes it causes. |
| `treatment` | Drug of choice plus alternatives and key prophylaxis. |
| `transmission` | Route, vector, reservoir, and classic exposure. |
| `virulenceFactor` | Toxins, capsules, adhesins, immune evasion — and what they do mechanistically. |
| `topicTags` | Powers the "By Topic" filter. Lowercase except proper nouns. |
| `tooltip` | The teaching note shown after answering. Under 60 words. |

**The seven quizzable fields** are `name`, `category`, `labFeatures`,
`manifestations`, `treatment`, `transmission`, and `virulenceFactor`. Any can
be the question or the answer, as long as one side is `name`.

### Keeping `category` useful

`category` does double duty: it is a quiz answer *and* it groups distractors,
so the hardest and most useful questions come from categories that are
clinically meaningful. Split along lines that actually get tested — "Septate
Mold" versus "Nonseptate Mold", "Encapsulated Yeast" versus "Yeast" — rather
than lumping everything into one bucket. A topic needs **6 distinct category
values** or validation fails, because there is no way to build six answer
choices otherwise.

### Overriding the quiz modes

A topic can declare its own modes with `quizAttrs`, which replaces the default
set for that kind:

```json
"quizAttrs": [
  { "key": "name",           "label": "Organism" },
  { "key": "labFeatures",    "label": "Lab & Morphology" },
  { "key": "manifestations", "label": "Manifestations" }
]
```

The first entry is treated as the identity field, and one side of every quiz
must be it. Only list keys that exist on your items.

---

## Adding an item

Append an object to the `drugs` array (drug topics) or `organisms` array
(pathogen topics) of the right file. That's it. New classes, categories, and
tags appear in the filters automatically.

## Adding a whole topic

1. Create `src/data/topics/your-topic.json` using the file shape above.
   Set `kind` to `"drug"` or `"pathogen"`.
2. Add its `id` to the `ORDER` array in `src/data/topics/index.js` if you
   want it in a specific position. Otherwise it sorts to the end alphabetically.
3. Run `npm run validate`.

Pathogen topics appear under the **Microbiology** heading on the home screen
and drug topics under **Pharmacology**; that grouping follows `kind`
automatically.

---

## Editing rules that matter

**Colors are automatic.** `buildClassColorMap` in `src/utils/classColors.js`
sorts the class names in a topic alphabetically and assigns palette colors in
order. Add any class name you like — it gets a stable, distinct color.

**Distractors come from the same topic.** When building six answer choices, the
app prefers drugs in the same `drugClass`, then drugs sharing a `topicTag`, then
anything else. Good tags make for harder, more useful questions.

**Shared values are handled.** If two drugs have an identical value for the
answered field, both are marked correct and the app says so after you answer.
You don't need to artificially differentiate them.

**Small tags are hidden, not broken.** A tag used by fewer than 3 drugs in its
topic won't appear as its own filter chip, because a quiz needs 3+ drugs to
start. The tag still works for distractor selection, and selecting several
tags at once unions them.

**Keep answer text distinctive.** If two items have near-identical
`mechanismOfAction` or `labFeatures` wording, the question becomes unfair.
Vary the phrasing.

**Mixing schemas is caught.** If a drug entry picks up a `manifestations`
field, or an organism entry picks up `sideEffects`, validation warns — that is
almost always a copy-paste slip.

---

## Validating

```bash
npm run validate
```

Runs automatically before every `npm run build`. It checks:

- valid JSON and correct topic structure
- all required fields present and non-empty
- unique `id` and `name` within each file
- at least 6 distinct values for every quizzable field
- fields borrowed from the other schema
- flags duplicate emoji, overlong tooltips, suspiciously short mechanisms

**Errors** fail the build. **Warnings** are advisory.

---

## Reviewing content for accuracy

The fastest review path is one topic at a time:

```bash
# every drug name and class in a topic, as a table
node -e "const t=require('./src/data/topics/renal.json'); t.drugs.forEach(d=>console.log(d.name.padEnd(32), d.drugClass))"

# every organism and category in a pathogen topic
node -e "const t=require('./src/data/topics/bacteriology.json'); t.organisms.forEach(o=>console.log(o.name.padEnd(36), o.category))"

# dump one item in full
node -e "const t=require('./src/data/topics/renal.json'); console.log(JSON.stringify(t.drugs.find(d=>d.id==='furosemide'),null,2))"
node -e "const t=require('./src/data/topics/bacteriology.json'); console.log(JSON.stringify(t.organisms.find(o=>o.id==='staph-aureus'),null,2))"
```

Content was written against standard USMLE Step 1 sources. Verify anything
you plan to rely on, especially doses, contraindications, and boxed warnings.

---

## Legacy files

`src/data/drugClasses.json`, `src/data/topicTags.json`, and
`src/data/topicRegistry.json` are **no longer used**. Classes, colors, tags, and
the topic list are all derived from the topic files now. You can delete them.
