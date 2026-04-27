# Claude Code Prompt — Potential Projects / Preconstruction Pipeline

## General Overview

The BD/Pre-con team currently manages their project pursuit workflow between **Vista** (the main ERP) and **Bid Tracer**. We're moving the Vista piece into our **Axiom web app** to modernize it and make it way more flexible. Bid Tracer stays as-is since it's still needed for maintenance agreements and similar stuff.

The idea is to rebuild the project pursuit workflow directly in Axiom — from the moment a project hits the radar as a potential lead, all the way through bidding, and landing on either awarded or lost. Instead of relying on Vista's clunky forms, the team will now have a dedicated **Potential Projects** section in Axiom where they can create and track pursuits, with fields and requirements that adapt based on where the project is in the process.

As projects move through stages (**Preliminary → Lead → Budget → Bid → Awarded/Lost**), the relevant fields show up and get enforced automatically. Everything stays connected — syncing with Vista in the meantime during transition.

The end result is the whole pre-con pipeline lives in one modern place, leadership gets real visibility into what's being pursued.

---

## Tech Stack (Current)

- **Next.js 16.2.2** (App Router)
- **React 19.2.4**
- **Tailwind CSS v4** (with `@tailwindcss/postcss`)
- **State**: React Context API (`ProjectsStore.jsx`)
- **Data persistence**: localStorage (client-side only for now — will move to API/database)
- **Auth**: Hardcoded user for development (will integrate with Axiom auth)

---

## Current Implementation Status

### What's Built & Working

**Navigation & Layout**
- Full sidebar navigation matching ACI Axiom design (220px, dark `#2c3340`)
- ACI logo with gold accent, expandable/collapsible tree menu
- Business Dev → Inputs → Potential Projects, Client Contacts
- Dashboard Analytics, Master Manpower, Revenue Forecasts (placeholder)
- TopNav with user info, job selector pill, feedback/settings
- Footer with version info

**Potential Projects — List Page** (`/potential-projects`)
- Searchable/filterable table with lazy loading (IntersectionObserver, 50-record chunks)
- Filters: search, Division, Stage, Type, Origin dropdowns
- "My Jobs" toggle (default on) scopes to current user
- Sortable columns (click header to sort asc/desc)
- Bid Tracer projects visually highlighted (yellow left border)
- NDA badge on projects
- Action buttons: Monthly Report, Companies, Competitors, New Potential Project

**Create Project Modal**
- 3-column compact grid layout
- All 10 required fields with inline validation
- Auto-generates project number (`YR-DV##-initials`) when all fields valid
- Save disabled until valid; date warnings (past dates, start < bid)
- Semantic Yes/No coloring on NDA dropdown (green/red tints)
- Navigates to detail page on creation

**Project Detail Page** (`/potential-projects/[id]`)
- Header with back nav, project name, number, NDA badge, Bid Tracer read-only badge
- "Send AR Job Creation Request" button (stub)
- Save button in header AND in bottom fixed bar

**Stage Pipeline**
- Horizontal stage selector with colored badges (Preliminary through Cancel)
- Stage switching is free — no blocking modal, user can switch any direction
- Requirements are cumulative up the pipeline (Lead → Budget → Bid → Award)

**Collapsible Accordion Sections** (all 10 sections, controlled state)
- Project Overview (4-column grid)
- Site Location (3-column, Google Places placeholder)
- Contacts (searchable CRM selector — see below)
- Notes (@mention support with user dropdown)
- Contract Details (4-column grid)
- Budget / Estimation (per-client estimation numbers)
- Clients (multi-client management with award selection)
- Bid Details (cost breakdown, estimators, trades, year burns, RequestLinkData)
- Award Details (3-column grid, team assignments, Request Job Number button)
- Loss Details (feedback, competitor, bid amount)

**Required Field Badges ("Required for" badges)**
- Right-aligned on each label row
- Shows ALL stages a field is required for (cumulative): "Required for `Lead` `Budget` `Bid`"
- Each stage badge uses its active color (solid fill, white text)
- Only appears when the current stage makes that field required

**Bottom Fixed Bar**
- Always visible, fixed to bottom, aligned with 220px sidebar
- Left: current stage badge, requirements progress (X/Y complete), progress bar, expand/collapse chevron
- Right: Save button with dirty state tracking
- Expandable requirements checklist — each item is clickable:
  - Opens the target accordion (closes all others)
  - Scrolls target field to center of viewport (`scrollIntoView block: center`)
  - Highlights the field with a 2-second amber glow animation (`field-highlight` CSS class)

**Client Contacts CRM Page** (`/client-contacts`)
- Full CRUD for contacts: name, role, company, email, phone, city, state
- Searchable table with filters
- 4-column add/edit form
- **Return-to-project flow**: When user arrives from a project's contacts section:
  - Fixed bottom bar: "You were adding contacts to **[Project Name]**" with "Go Back to Project" button
  - Dismiss option to clear the return signal
  - On return: auto-opens Contacts accordion, scrolls to contacts section

**Project Contacts Integration**
- "Add Contact" opens a searchable selector pulling from the Client Contacts CRM database
- Role dropdown to assign contact role before adding
- Filters out contacts already on the project
- "Create New Contact in CRM" link: auto-saves project, stores return signal in localStorage, navigates to `/client-contacts`
- On return from CRM: Contacts accordion auto-opens, scrolls into view

**Company & Contacts Manager** (modal from list page)
- CRUD for companies with people (primary contact)
- Search by name, city, state

**Competitor Manager** (modal from list page)
- Standalone CRUD: CompanyName, ContactInfo, Notes
- Axiom only, never syncs to Vista

**Monthly Snapshot Report** (modal from list page)
- Date range filter
- Project data display (Excel export placeholder)

**Compact UI / Design System**
- Dense ERP-style interface — smaller paddings, tighter spacing
- Input padding: `7px 10px`, font `12px`
- Labels: `11px`, `marginBottom: 4px`
- Form grids: 3-column or 4-column default
- Semantic Yes/No selects: green tint for "Yes", red tint for "No" (via `yesNoStyle()` helper)
- All spacing via inline `style` props (not Tailwind classes) per DESIGN.md

**State Management** (`ProjectsStore.jsx`)
- React Context with `useProjects()` hook
- Collections: `projects`, `companies`, `competitors`, `clientContacts`
- Full CRUD for each collection via `useCallback`
- localStorage persistence with load-on-mount pattern
- Constants: STAGES, PROJECT_TYPES, DIVISIONS, CONTRACT_TYPES, END_SECTORS, US_STATES, CURRENT_USER, PROOF_TYPES, INSURANCE_PROGRAMS, TRADES, CONTACT_ROLES, CONSTRUCTION_TYPES, PROJECT_SIZE_UM, ESTIMATORS_LIST, USERS_LIST

---

## File Structure

```
app/
├── layout.js                          # Root layout (TopNav, Sidebar, Footer)
├── page.js                            # Home page
├── globals.css                        # Tailwind v4 + theme + field-highlight animation
├── components/
│   ├── TopNav.jsx                     # Top navigation bar
│   ├── Sidebar.jsx                    # Full tree sidebar (220px, ACI branding)
│   └── Footer.jsx                     # Footer with version
├── potential-projects/
│   ├── page.js                        # List page wrapper
│   ├── [id]/
│   │   └── page.js                    # Detail page wrapper
│   └── components/
│       ├── ProjectsStore.jsx          # Context provider + all CRUD + constants
│       ├── ProjectListTable.jsx       # Filterable/sortable lazy-loaded table
│       ├── CreateProjectModal.jsx     # New project modal (3-col grid)
│       ├── ProjectDetailView.jsx      # Full detail page (all sections)
│       ├── CollapsibleSection.jsx     # Controlled accordion component
│       ├── StageSelector.jsx          # Horizontal stage pipeline selector
│       ├── StageChangeModal.jsx       # (Legacy — no longer used, stage switching is free)
│       ├── CompanyContactsManager.jsx # Company CRUD modal
│       ├── CompetitorManager.jsx      # Competitor CRUD modal
│       └── MonthlySnapshotReport.jsx  # Report modal
└── client-contacts/
    ├── page.js                        # CRM page wrapper
    └── ClientContactsView.jsx         # Full CRM contacts table + forms
```

---

## 1. Navigation & Landing Page

- Sidebar tree menu under **"Business Dev → Inputs"** with **"Potential Projects"** and **"Client Contacts"**
- Searchable table of all existing potential projects, sorted by status
- **Filter header:** search bar, Division, Stage, Type, Origin dropdowns
- **Origin** defaults to "Axiom" with "Bid Tracer" as an alternative
- **"My Jobs" toggle** (on by default) scopes results to jobs created by the current user
- Projects imported from Bid Tracer are **visually highlighted** in the table (yellow border)
- When opening a Bid Tracer project, **all fields are read-only**
- Table uses **lazy loading** — records load in chunks as the user scrolls (50 per chunk)
- Sortable by any column (clickable headers)
- **Display columns:** Project #, Project Name, Division, Stage (colored badge), Probability %, Bid Date, Est. Start, Type, Created By, Created Date
- NDA projects show an "NDA" label/badge

---

## 2. Create Project Modal

- 3-column compact grid layout
- **Required fields (all must be filled before save):**
  1. `TagName` — Free text
  2. `Division` — Pre-populates from user's PRDept, must remain editable
  3. `ProjectName` — Free text
  4. `Description` — Free text (multiline)
  5. `Probability%` — Integer 0–100
  6. `BidDate` — Date picker
  7. `EstimateProjectStart` — Date picker
  8. `ProjectStatus` — Dropdown (see Section 4 for values)
  9. `ProjectType` — Dropdown (see below for values)
  10. `NDA` — **Yes/No dropdown** with semantic coloring (green/red)

- **Potential Project Number** auto-generates format `YR-DV##-initials` — only after ALL required fields are filled
- Save button disabled until all fields are valid

### Project Type Values (from Vista)
| Code | Display Name |
|------|-------------|
| I | Internal |
| M | Custom Fab |
| N | New/Installation |
| NA | N/A |
| R | Renovation |
| W | Warranty |

---

## 3. Project Detail Page

### 3.1 Header & Display Fields
- Display: Tag Name, SubmissionDate, Division, ProjectName, Description, Probability%, BidDate, EstimateProjectStart, ProjectStatus, ProjectType, NDA
- **DataSource (origin)** field visible on the page (BidTracer or Vista/Axiom)
- **"Send AR Job Creation Request"** button in the header — always visible at top right
- **Save** button in header AND bottom fixed bar

### 3.2 Dynamic Sections (Stage-Gated)
- All stage sections **always visible as controlled accordions**
- Fields only become **required** when that stage is reached
- "Required for" badges show all applicable stages (cumulative)
- Stage switching is **free** — no blocking modal
- **Save always allowed** regardless of stage
- Stage is **NOT strictly forward-only** — Budget ↔ Bid can go back and forth, Award ↔ Lost are valid

### 3.3 Bottom Fixed Bar
- Fixed to bottom, offset by sidebar width (220px)
- Shows current stage, requirements progress, expandable checklist
- Each requirement item is **clickable** — opens target accordion, scrolls to field, highlights with amber glow
- Save button with dirty state tracking

---

## 4. Project Stages (Status)

Dropdown values sourced from Vista with Status Order preserved:

| # | Stage Name | Key Requirements When Active |
|---|---|---|
| 1 | Preliminary | Initial required fields only |
| 2 | Lead | Site Location, at least 1 Client contact |
| 3 | Budget | EstimationNumber, Contract Details |
| 4 | Bid | Cost Breakdown (> $0), Estimators, Trades, Year Burns, End Date |
| 5 | Pending | — |
| 6 | Award | Award Details, Project Manager |
| 7 | Lost | Lost Feedback, Competitor, Notice Date |
| 8 | Cancel | — |

---

## 5. Site Location Section

- **Google Places API autocomplete** as user types street address (placeholder — not yet connected)
- Required fields: **Street, City, State, Zip Code, Country, Region**
- 3-column grid layout

---

## 6. Notes Section

- View, add, edit, delete notes
- Notes are **timestamped**
- **@mention support** — typing `@` shows a searchable dropdown of users

---

## 7. Contract Section

- 4-column grid layout
- Fields: **SquareFootage, ProjectSizeUM, PrimeOrSub (radio), ContractType, EndSector, ConstructionType**
- **SalesTaxExemptYN** — yes/no dropdown with semantic coloring
- **InsuranceProgram** — dropdown

---

## 8. Client Contacts CRM (`/client-contacts`)

- **Standalone page** under Business Dev → Inputs → Client Contacts
- Full CRUD: Name, Role, Company, Email, Phone, City, State
- Searchable table, 4-column add/edit form
- **Return-to-project flow**: When arriving from a project's contacts section, a fixed bottom bar shows "You were adding contacts to [Project Name]" with a "Go Back to Project" button
- On return: project auto-opens Contacts accordion and scrolls to it

---

## 9. Company & Contacts Master Management

- CRUD for **Companies** and **People**, one Primary per company
- Company search dropdown shows **CompanyName + City + State**
- Accessible from Potential Projects list page header

---

## 10. Competitor Master Management

- **Standalone admin area** (modal from list page) for managing the competitor list
- CRUD: CompanyName, ContactInfo, Notes
- **Axiom only — never syncs to Vista**

---

## 11. Contacts Section (on Project Details)

- Searchable contact selector pulling from **Client Contacts CRM database**
- Role dropdown to assign role before adding
- Filters out already-added contacts
- **"Create New Contact in CRM" link**: auto-saves project, navigates to `/client-contacts` with return signal
- On return: Contacts accordion auto-opens, scrolls into view
- Contact roles: Client, Owner, Engineer, Architect, ACI/API/POC, CommissionedSalesPerson, Competitor

---

## 12. Budget Section (Dynamic — Stage: Budget)

- **EstimationNumber** — view and edit
- **Separate input per client** if multiple clients

---

## 13. Bid Section (Dynamic — Stage: Bid)

### 13.1 Core Fields
- Total Bid Cost, End Date, Cost Breakdown (3-col grid), Yearly Burns, Trades, Estimators
- **Yearly Burns** must validate that all 5 years sum to exactly 100% (alert shown)
- All dollar fields cannot be zero

### 13.2 RequestLinkData Fields
- 9 Yes/No toggles with **semantic coloring** (green/red): SalesTaxExempt, SubTierLienWaivers, CertifiedPayroll, PrevailingWageScale, BidBondReq, Bonded, OCIPPayroll, BureauCapitalOutlayMgmt, RebateSpendProgram
- Additional: LiquidatedDamages (amount + per), ProofToProceed, DocumentToProceed, DocumentId, Retainage%, WarrantyMonths, InsuranceProgram, GCBillDay, SuggestedJobNo

### 13.3 Specific Field Rules
- **Trades** dropdown from Vista: CIVIL, ELEC, ELECSHOP, FIREPRO, HVAC, IRONWRK, MILLWRIGHT, PIPESHOP, PIPING, PLUMBING, PLUMBSHOP, SHEETML, SMSHOP
- **Service Agreement** checkbox
- **Estimators** dropdown shows Name + Department

---

## 14. Awarded Section (Dynamic — Stage: Award)

- Fields: **Awarded Date, Awarded Amount, Awarded Cost, AwardedMarginPercent, ProjectManager, Superintendent, SuggestedJobNo**
- **Request Job Number** button (stub — email integration pending)
- 3-column grid with team assignments sub-section

---

## 15. Lost Section (Dynamic — Stage: Lost)

- **Lost Feedback** (textarea), **Primary Competitor** (from competitor list), **Competitor Bid Amount**, **Date of Notice**
- 3-column grid layout

---

## 16. Multiple Clients on One Bid

- One project can be bid to **multiple clients at different amounts**
- Client management section with add/remove
- Per-client estimation numbers in Budget section
- On award, user selects **which client won**

---

## 17. Monthly Snapshot Report

- **Static capture** of all potential project data at month end
- Downloadable as **Excel** for any selected date range (placeholder)
- Accessible from the Potential Projects section header

---

## 18. Validation Rules

### 18.1 Date Logic
- Allow past dates but flag with warning (yellow highlight/border)
- `EstimateProjectStart` should be >= `BidDate` (warn if not, don't hard-block)

### 18.2 Dollar Values
- Any currency field must be > $0 when required
- Format as USD currency with commas and 2 decimal places

### 18.3 Year Burns
- Each row is a percentage (0–100)
- Sum of all 5 year burn rows must equal exactly 100% — alert shown if not

### 18.4 Save Behavior
- Creation modal cannot be saved unless ALL required fields are populated (disabled save, inline errors)
- After creation, **save is always allowed** regardless of stage
- Stage switching is free — no blocking modal, inline "Required for" badges guide the user

---

## 19. Vista Integration Points

During the transition period, the system syncs with Vista:
- **Division mapping:** PRDept ↔ JCDept
- **ProjectStatus values** sourced from Vista with Status Order preserved
- **ProjectType values** from Vista lookup
- **Trades** from Vista PC Scope Trades Lookup
- **Proof To Proceed** values from Vista
- **Companies** checked against Vista bARCM + bPMFM before creation
- **Lowest bid amount** across clients syncs to Vista
- **Owner/Engineer/Architect** companies write directly to Vista bPMFM when new

---

## 20. Implementation Order (Suggested Phases)

**Phase 1 — Core CRUD & Pipeline** ✅ DONE
- Navigation and landing page with filters
- Project creation modal with validation
- Auto-numbering logic
- Project detail page with all sections as accordions
- Stage management and field gating
- List view with sort/filter/search and lazy loading

**Phase 2 — Contacts & Companies** ✅ DONE
- Client Contacts CRM page with full CRUD
- Contacts section on project details with CRM selector + return flow
- Company & Contacts Master Management (modal)
- Competitor Master Management (modal)

**Phase 3 — Stage-Specific Sections** ✅ DONE
- Budget section with per-client EstimationNumber
- Bid section with full RequestLinkData, Trades, Estimators
- Awarded section with Job Number Request placeholder
- Lost section with competitor tracking
- Multiple Clients on One Bid (client management)

**Phase 4 — Notes, Reporting & Integration** (Partial)
- ✅ Notes with @mention support
- ✅ Monthly Snapshot Report (placeholder)
- ⬜ Google Places API for Site Location
- ⬜ Vista sync integration points
- ⬜ Bid Tracer import (read-only display)
- ⬜ Email integration for AR Job Creation Request
- ⬜ Excel export for Monthly Snapshot
