# VendorLens

### Vendor Security & Privacy Risk Assessment Platform

VendorLens is a web application designed to help businesses assess third-party software vendors, identify security and privacy risks, and document assessment results.

The project demonstrates practical application development using React, TypeScript, risk-scoring algorithms, browser storage, automated testing and CI/CD.

## Live Demo

https://robertns021.github.io/VendorLens/

## Features

### Vendor Management
- Register, edit and delete vendors.
- Search and filter vendor records.
- Classify vendors by data sensitivity.
- Store vendor information locally.

### Security Assessments
- 12-question security and privacy questionnaire.
- Four assessment categories:
  - Security
  - Privacy
  - Compliance
  - Operational Resilience
- Yes, No and Unknown responses.
- Evidence notes for individual controls.
- Saved assessment drafts.
- Completed assessment history.

### Risk Scoring
- Transparent weighted risk calculation.
- Individual category scores.
- Automatic risk classification.
- Recommendations based on identified weaknesses.

### Reporting and Analytics
- Risk distribution dashboard.
- Average risk analysis.
- Category-level risk breakdown.
- Assessment history.
- CSV export.
- Printable assessment reports and PDF export.

## Technology Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Application logic and type safety |
| Vite | Development and production builds |
| Tailwind CSS | Responsive UI styling |
| Lucide React | Interface icons |
| LocalStorage | Client-side data persistence |
| Vitest | Automated testing |
| ESLint | Code quality |
| GitHub Actions | Automated deployment |

## Risk Scoring Methodology

Each assessment contains 12 weighted controls with a total weight of 100.

Answer multipliers:

| Answer | Multiplier |
|---|---:|
| Yes | 0 |
| No | 1 |
| Unknown | 0.5 |

Risk score:

Risk Score = Sum of (Question Weight × Answer Multiplier)

Risk classification:

| Score | Classification |
|---|---|
| 0–29 | Low |
| 30–59 | Medium |
| 60–100 | High |

The scoring methodology is an illustrative portfolio implementation and is not an official certification or industry-standard assessment.

## Getting Started

Requirements:
- Node.js (LTS recommended)
- npm
- Git

Clone the repository:

```bash
git clone https://github.com/robertns021/VendorLens.git
```

Navigate to the project:

```bash
cd VendorLens
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

## Testing

Run ESLint:

```bash
npm run lint
```

Run automated tests:

```bash
npm test
```

Build the production application:

```bash
npm run build
```

## Data and Privacy

VendorLens currently uses browser LocalStorage.

- Data is stored locally in the user's browser.
- There is no backend or cloud database.
- Data does not synchronise between devices or browsers.
- Clearing browser storage can remove saved records.

The application is a portfolio demonstration. Vendor names and example assessment data should be fictional. Do not enter sensitive business, security or personal information.

## Project Purpose

VendorLens was developed as a practical programming portfolio project to explore:

- Component-based application architecture.
- TypeScript data modelling.
- State management and CRUD operations.
- Risk assessment algorithms.
- Automated testing.
- Client-side data persistence.
- Responsive application design.
- Continuous integration and deployment.

---

Developed as an independent portfolio project.