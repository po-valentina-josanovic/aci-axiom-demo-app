# Axiom Demo App - Design System

## Application Overview
A manpower planning tool for construction/industrial projects. Users manage job budgets, labor distribution across shop departments, and view timelines of resource allocation.

## Layout Structure
```
┌──────────────────────────────────────────────┐
│                  TopNav (48px)                │
├────┬─────────────────────────────────────────┤
│    │          PageHeader                      │
│ S  │          ControlsBar                     │
│ i  ├─────────────────────────────────────────┤
│ d  │                                          │
│ e  │     JobSection (repeatable)              │
│ b  │       ├── JobHeader                      │
│ a  │       ├── JobTable + TimelineGrid        │
│ r  │       └── Actions (Borrow/Notes)         │
│    │                                          │
│48px│     JobSection (repeatable)              │
│    │       ├── JobHeader                      │
│    │       ├── JobTable + TimelineGrid        │
│    │       └── Actions (Borrow/Notes)         │
│    │                                          │
├────┴─────────────────────────────────────────┤
│                   Footer                      │
└──────────────────────────────────────────────┘
```

## Color Palette
| Token              | Hex       | Usage                              |
|--------------------|-----------|------------------------------------|
| Nav Background     | `#1a2332` | Top navigation bar                 |
| Sidebar Background | `#2c3e50` | Left sidebar                       |
| Primary Blue       | `#3b82f6` | Job header bars, active states     |
| Button Blue        | `#2196f3` | Action buttons, edit icons         |
| Button Pink/Red    | `#e91e63` | See Notes button, red accents      |
| Red Accent         | `#ef4444` | No Job Selected badge, Budget dot  |
| Teal               | `#0d9488` | Borrow more button                 |
| Table Header BG    | `#dbeafe` | Column headers (blue-100)          |
| Background Light   | `#f1f5f9` | Main content area background       |
| Text Primary       | `#1e293b` | Main text color                    |
| Text Secondary     | `#64748b` | Muted text, labels                 |
| Border             | `#cbd5e1` | Table borders, dividers            |
| Green Online       | `#4ade80` | Online status indicator            |

## Typography
- **Font Family**: Segoe UI, Arial, sans-serif
- **Base Size**: 13px
- **Page Title**: 20px bold
- **Table Headers**: 12px semibold
- **Table Body**: 12px regular
- **Button Text**: 13-14px medium
- **Footer**: 12px regular

## Components

### 1. TopNav (`TopNav.jsx`)
- Height: 48px, dark navy background
- Left: User avatar (circle, initials), name, online status with green dot
- Center: Red "No Job Selected" dropdown badge
- Right: Feedback button (blue), settings gear icon, user profile icon

### 2. Sidebar (`Sidebar.jsx`)
- Width: 48px, dark blue-gray background
- Vertical icon buttons: Home, Bookmark (active/highlighted), Chart, Calendar, Grid
- Active state: white background opacity, brighter icon

### 3. PageHeader (`PageHeader.jsx`)
- White background with bottom border
- Left: "Master Manpower" title (bold, 20px)
- Right: View toggle (Timeline active, Graph), "+ Add Job" blue button

### 4. ControlsBar (`ControlsBar.jsx`)
- White background with bottom border
- "Reorder Jobs" button with hamburger icon
- Company dropdown (value: "1")
- Departments dropdown (value: "010D - DSM")

### 5. JobSection (`JobSection.jsx`)
Wrapper component combining:
- **JobHeader**: Budget/Bid radio toggle + blue job ID bar with edit icon
- **JobTable**: Data table + timeline grid
- **Bottom Actions**: "Borrow more" (teal) left, "See Notes" (red) right

### 6. JobHeader (`JobHeader.jsx`)
- Left: Budget/Bid toggle (radio-style buttons, Budget active = red dot)
- Right: Blue bar spanning remaining width with job ID text + edit pencil icon

### 7. JobTable (`JobTable.jsx`)
- **Left columns**: Shop name, Hours, Man Days, Months, Beginning, End, Distribution
- **Right columns**: Monthly timeline grid (Mar-Oct 2025) with blue header
- **Rows**: Plumbing Shop, Pipe Shop, Sheet Metal Shop, Steel Shop, Paint/Blast Shop, Electrical Shop
- **Pipe Shop** has sample data: 11,000 hours, 1,375 man days, 6 months, 01-2026 to 07-2026
- **Distribution column**: Edit button (blue square) + Reset link for filled rows, "+" button for empty rows
- **Total row**: Bold, sums of all values
- Timeline cells show "0" by default

### 8. Footer (`Footer.jsx`)
- White background with top border
- Left: Copyright notice with ProfitOptics Inc (blue link)
- Right: Version numbers

## Shop Departments (Standard Rows)
1. Plumbing Shop
2. Pipe Shop
3. Sheet Metal Shop
4. Steel Shop
5. Paint/Blast Shop
6. Electrical Shop

## Key Data Fields per Shop Row
| Field        | Type    | Description                              |
|-------------|---------|------------------------------------------|
| Hours       | Number  | Total labor hours allocated              |
| Man Days    | Number  | Total man-days (hours / 8)               |
| Months      | Number  | Duration in months                       |
| Beginning   | Date    | Start date (MM-YYYY format)              |
| End         | Date    | End date (MM-YYYY format)                |
| Distribution| Actions | Edit distribution / Reset / Add new      |

## Timeline Grid
- Displays months horizontally (currently Mar-Oct 2025)
- Blue header bar shows the year
- Each cell shows allocated man-days for that month
- Default value: 0

## Interactive Elements
- **Budget/Bid Toggle**: Radio-style switch between Budget and Bid views
- **Edit (Pencil) Icons**: On job header bar and distribution column
- **Reset Button**: Clears distribution for a shop row
- **"+" Button**: Opens distribution entry for empty rows
- **Borrow More**: Adds borrowed resources to the job
- **See Notes**: Opens notes panel for the job
- **Reorder Jobs**: Drag-reorder job sections
- **Add Job**: Creates a new job section
- **Company/Department Dropdowns**: Filter by company and department
- **View Toggle**: Switch between Timeline and Graph views

## CSS Architecture (Tailwind v4)
- Uses `@import "tailwindcss"` which creates CSS layers via `@theme` and `@layer base`
- **Critical**: Do NOT add a `* { padding: 0; margin: 0; }` reset — Tailwind v4 preflight handles this. Adding one (even in `@layer base`) breaks utility class overrides for form elements.
- **Potential Projects module** uses inline `style` props for all spacing/padding to guarantee rendering. Tailwind classes are used for colors, flex, etc. in the shared shell (TopNav, Sidebar, Footer).

## Compact UI Philosophy
The interface should feel **dense and efficient** — closer to a professional ERP/data tool than a consumer app. Smaller paddings, tighter spacing, and multi-column grids that make the most of screen real estate.

- Prefer **3-column or 4-column grids** for form inputs in detail views and wider modals instead of 2-column layouts. Only use 2 columns when the modal is narrow or a field needs extra width (e.g. description/textarea).
- Keep inputs, labels, and spacing compact so more data fits on screen without scrolling.

## Semantic Yes/No Selects
All `<select>` dropdowns for Yes/No fields must be **semantically colored** based on the selected value:
- **"Yes"** → green tint: `color: #15803d`, `background: #f0fdf4`, `borderColor: #86efac`
- **"No"** → red tint: `color: #b91c1c`, `background: #fef2f2`, `borderColor: #fecaca`
- **Unselected / placeholder** → neutral default styling

Use a shared `yesNoStyle(value)` helper that returns the appropriate inline style object.

## Spacing & Padding Standards
All spacing uses inline `style` props (not Tailwind classes) to avoid CSS cascade conflicts.

| Element                    | Padding/Spacing                      |
|----------------------------|--------------------------------------|
| Page Headers               | `padding: 10px 20px`                 |
| Content Areas              | `padding: 16px 20px`                 |
| Modal Header/Footer        | `padding: 14px 24px`                 |
| Modal Form Body            | `padding: 16px 24px`                 |
| Form Field Spacing         | `gap: 12px` (flex column)            |
| Form Grid Gaps             | `gap: 12px` (CSS grid)               |
| Input Fields               | `padding: 7px 10px`                  |
| Input Font Size            | `12px`                               |
| Labels                     | `marginBottom: 4px`                  |
| Table Header Cells         | `padding: 10px 14px`                 |
| Table Body Cells           | `padding: 10px 14px`                 |
| Collapsible Section Header | `padding: 10px 16px`                 |
| Collapsible Section Body   | `padding: 12px 16px`                 |
| Buttons (primary)          | `padding: 7px 14px`                  |
| Cards/Sections gap         | `gap: 12px` (flex column)            |

### Border Radius
- Inputs, buttons, selects: `6px`
- Cards, modals, tables: `8px`
- Badges, pills: `12px`

## Responsive Notes
- The table scrolls horizontally on smaller screens
- Sidebar collapses to icon-only (already icon-only)
- Minimum recommended viewport: 1024px
