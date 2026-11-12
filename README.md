# CareTrack — Quarantine & Fever Ward Operations Prototype

A functional, zero-build static prototype built for the virus quarantine & treatment facility TPM case study.

## Screens & UI Flow
1. **Operations Overview**: Live KPI strip (74-bed occupancy, pending daily temperatures, ready Doctor visits, discharge-eligible count, cure/mortality benchmark), 4-stage sequential workflow pipeline, Doctor → Admin discharge handoff queue, and role-specific quick workspace.
2. **Care Queue**: Searchable, sortable patient table with stage filters (`Needs Temp`, `Ready for Doctor`, `Discharge Queue`, `Fever Alert`, `Closed Outcomes`) and inline role-gated actions.
3. **Patient Clinical Journal (Slide-Over Drawer)**: Multi-day SVG fever trend chart, consecutive no-fever day counter (`0/3` to `3/3`), chronological temperature & treatment history, and role-specific clinical/discharge actions.
4. **74-Room Map & Admissions**: Interactive visual map of `Room 01`–`Room 74`, bed-capacity & room-collision guarded admission form, and Admin discharge execution queue.
5. **Quality & Mortality**: Tracks facility Cure Rate against the **85% benchmark** and Mortality Rate against the **15% alert ceiling**, with a closed outcomes ledger and Head Doctor clinical policy controls.

## Demo Roles & Permissions
- **Nurse**: Record daily patient temperatures, view pending readings, confirm same-day duplicates, flag fever spikes (`>= 38.0°C`).
- **Doctor**: Review temperature journals, log daily clinical visits (strictly gated after today's Nurse temperature), approve 3-day afebrile patients for Admin discharge, and log mortality outcomes.
- **Admin Staff**: Manage 74-room occupancy, admit patients into vacant rooms, and finalize Doctor-approved discharges to free beds.
- **Head Doctor**: Oversee quality/mortality benchmarks, review closed outcomes, perform physician reviews, and configure fever/discharge thresholds.

## Run Locally
Open `index.html` in any modern browser, or serve statically:
```bash
npx serve .
```

## Deploy to Vercel
1. Push `index.html`, `styles.css`, `app.js`, `vercel.json`, and `README.md` to a GitHub repository (or run `npx vercel` directly from this folder).
2. In Vercel, select **Add New → Project**, import the repository with default static settings (no build step required), and deploy.

## Prototype Limitations
This front-end demonstration persists state in browser `localStorage` without backend authentication, multi-user concurrency locking, or HIPAA/clinical audit storage. Production deployment requires a server API, database persistence, role-based auth, and clinical validation.
