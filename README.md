# Digital Haven
### Your Digital Life, Thoughtfully Protected

A premium, elegant, pastel-themed digital safety and personal organisation web application built as a college project. Runs entirely in the browser with no server, database, or framework required.

---

## Features

### Dashboard
- Personalized greeting using your saved display name and time of day
- Digital safety score ring (illustrative estimate, not a real scan)
- Five key metric cards: total accounts, 2FA-protected accounts, recovery readiness %, monthly spend, upcoming renewals
- Security Insights alerts panel
- Upcoming Renewals panel (next 60 days)
- Recent Activity log
- Quick-action buttons: Add Account, Add Subscription, View Checklist, Review Risks

### Digital Accounts
- Add, edit, and delete account records
- Categories: Email, Social Media, Banking, Shopping, Work, Education, Entertainment, Health, Other
- Track 2FA status (Enabled / Disabled / Unknown) and primary recovery method
- Search by name, filter by category and 2FA status
- Confirmation before deletion
- Never stores real passwords or credentials

### Subscriptions
- Add and delete subscriptions with name, cost, billing frequency, category, and renewal date
- Billing frequencies: Weekly, Monthly, Quarterly, Yearly (monthly equivalent calculated correctly)
- Monthly total and estimated annual cost summary
- CSS horizontal bar chart showing spending breakdown by category
- Search and category filter

### Risk Assessment
- Visual risk meter with simulated composite score
- Six structured risk findings with severity (High/Medium/Low), dynamic status, explanation, and recommended action
- Severity filter
- Security recommendations list
- Clearly labelled as educational simulation — no real scanning

### Recovery Centre
- Interactive checklist grouped into four categories: Account Access, Recovery Contacts, Backup Preparation, Security Settings
- Completion percentage and animated progress bar
- Filter tabs: All / Pending / Completed
- Add custom checklist tasks with category assignment
- Reset checklist with confirmation
- Recovery Principles tip cards

### Settings
- **Profile & Workspace:** set your display name and workspace label (persisted to localStorage)
- **Appearance:** three coordinated pastel themes — Sage & Ivory (default), Soft Lavender, Buttercream & Blush
- **Accessibility:** Reduce Motion toggle
- **Data Management:** export to JSON, import from JSON backup, reset to sample data, clear all data (all with confirmation dialogs)
- **Application Info:** technologies used, privacy notice, security assessment disclaimer

---

## Design

- **Palette:** warm ivory background, sage green, butter yellow, soft mint, dusty blush, lavender
- **Typography:** Playfair Display (headings) + DM Sans (body, labels, navigation)
- **Icons:** Lucide outline icons — zero emojis
- **Layout:** fixed sidebar with profile area, responsive main content, mobile top-bar drawer

---

## Running the App

1. Open the project folder.
2. Double-click `index.html` to open it in your browser, **or** use a local server:

```bash
# Python (any modern version)
python -m http.server 8080
```

Then visit `http://localhost:8080`.

3. On first load, sample data is loaded automatically.
4. All changes persist in your browser's `localStorage`.

---

## Tech Stack

| Layer      | Technology                     |
|------------|-------------------------------|
| Structure  | HTML5                         |
| Styling    | CSS3 (custom properties, grid, flexbox) |
| Logic      | Vanilla JavaScript (ES6+)     |
| Icons      | Lucide (CDN)                  |
| Fonts      | Google Fonts (Playfair Display + DM Sans) |
| Storage    | Browser localStorage          |
| Backend    | None                          |

---

## Privacy Notice

All data entered in Digital Haven is stored **exclusively in your browser's localStorage**. No information is transmitted to any server or third-party service. Clearing browser storage or switching browsers will erase local data unless you export it first.

**Do not enter real passwords, PINs, banking credentials, or other sensitive authentication information.**

---

## Academic Context

Built for a college project submission (Academic Year 2025–26) to demonstrate:
- Client-side security posture management concepts
- Multi-factor authentication and recovery method awareness
- Subscription financial tracking with frequency normalisation
- Simulated risk assessment and structured remediation planning
- Emergency recovery preparedness checklists
- Frontend-only data persistence with localStorage

*All sample data is entirely fictional and for demonstration purposes only.*
