# 🩺 Kareway Bedside Care Tracker With AAC

![React](https://img.shields.io/badge/React-19-61DAFB)
![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38BDF8)
![Status](https://img.shields.io/badge/status-completed-brightgreen)

## 📌 Overview

In home and bedside care, two things often fall through the cracks: keeping a clear daily record of the patient's care, and understanding what the patient needs when they can't speak.

**Kareway Bedside Care Tracker** is a patient care tracking app built at [Kareway Health](#) for caregivers and nurses. It logs vitals, medications, fluids, diet, restroom visits and sleep for each patient, and flags anything below target or out of range.

It also has a built-in **AAC (augmentative and alternative communication)** board for patients who can't speak, such as those recovering from stroke or living with neurological conditions. The patient taps a picture tile, and the device speaks the phrase aloud in **Tamil or English**. Every tap is logged alongside the rest of the day's care record.

## ✨ Features

### 📋 Care Tracking (for caregivers)
- **Vital signs:** temperature, BP, SpO₂, pulse, weight and blood glucose, with borderline and critical readings flagged
- **Medications:** per-patient schedule (dosage, frequency, timings, food instructions, prescribing doctor), daily dose checklist and overdue alerts
- **Daily trackers:** water intake, meals, protein, carbs, supplements, restroom visits, urine output and sleep, each against a daily target
- **Diet log:** weekly meal planner (breakfast, lunch, dinner, snacks) with calories, protein, carbs, fat and fiber
- **History:** a timeline of patient requests, for shift handovers and care reviews
- **Multi-patient:** separate records for each patient, with instant switching

### 🗣️ AAC Communication (for patients)
- **Phrase board:** picture tiles that speak aloud on tap, grouped by category (medical, comfort, needs, movement, social, emergency)
- **Bilingual:** Tamil and English text and speech
- **Pain scale:** 1 to 10 pain reporting, spoken and logged
- **Emergency button:** always visible, with hold-to-confirm to prevent accidental triggers
- **Custom phrases:** caregivers can add, edit and reorder each patient's tiles, with ARASAAC pictograms

### ♿ Accessibility
- **Scan mode:** tiles highlight one by one, and the patient selects with a single switch, for patients who can't tap precisely
- **Dwell-to-select:** hover to activate instead of tapping
- **Large text, high contrast and night mode**
- **Haptic feedback** and adjustable speaking rate

### 🔒 Reliability and Privacy
- **Offline-first:** keeps working when the backend is down, then syncs automatically
- **Local by default:** data stays on the device, with optional Firebase sync

## 🔄 How It Works

```
Caregiver logs vitals, meds, fluids, diet, sleep ─┐
                                                  ├─> Per-patient daily record ─> Targets and alerts ─> Shift handover
Patient taps AAC tile ─> Phrase spoken aloud ─────┘
```

## 🛠️ Tech Stack

| Area | Tools |
|------|-------|
| Frontend | React 19, Vite, Tailwind CSS |
| UI | lucide-react icons, dnd-kit (drag and drop) |
| Speech | Web Speech API (SpeechSynthesis) |
| Backend | Node.js, Express |
| Storage | JSON file store, browser localStorage, optional Firebase Firestore |
| Pictograms | ARASAAC |

## 📁 Project Structure

```
patient-aac-app/
├── start.bat / start.sh       # One-click launchers
├── launch.js                  # Starts backend + frontend together
├── SETUP.txt                  # Setup guide
├── FEATURES.txt               # Full feature reference
└── project/
    ├── src/
    │   ├── views/             # Board, Trackers, Diet, Meds, History, Settings
    │   ├── components/        # Vitals, med reminders, trackers, AAC tiles, etc.
    │   ├── data/              # Default phrases and patients
    │   └── lib/api.js         # Backend client with offline cache
    └── server/
        ├── server.js          # Express entry point
        ├── routes/            # actions, logs, layouts, patients, symbols
        ├── utils/jsonStore.js # Local JSON storage
        └── config/firebase.js # Optional Firestore setup
```

## 🚀 Getting Started

Requires **Node.js 20+**.

```bash
git clone https://github.com/<sushmithakgit>/<Kareway-Bedside-Care-Tracker>.git
cd <Kareway-Bedside-Care-Tracker>

# Windows
start.bat

# macOS / Linux
chmod +x start.sh
./start.sh
```

The first launch installs dependencies, then opens the app at `http://localhost:5173`. The backend runs on port 5000.

See `SETUP.txt` for troubleshooting and `FEATURES.txt` for a full walkthrough.

## 🔌 API

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Backend status |
| `/api/patients` | Patient profiles |
| `/api/logs` | Patient request history |
| `/api/actions` | AAC phrase tiles |
| `/api/layouts/:patientId` | Per-patient AAC board layout |
| `/api/symbols/search` | ARASAAC pictogram search |

## 🔭 Future Work

- Move tracker, diet, meds and vitals data from localStorage to the backend, so records sync across devices
- Push alerts to the caregiver's phone for emergencies, overdue meds and critical vitals
- Exportable daily care reports for doctors and families
- Sentence building in the AAC board, beyond prewritten phrases
- Real video calling in the family panel

## 🙏 Acknowledgements

Pictograms by Sergio Palao, from [ARASAAC](https://arasaac.org) (Government of Aragón), licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

## 👤 Author

**Sushmitha K**
