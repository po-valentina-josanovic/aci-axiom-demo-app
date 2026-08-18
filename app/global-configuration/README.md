# Global Configuration

App-wide settings that are **not** tied to a user or a role. Anything that
depends on who someone is belongs in `app/user-management/` instead — see
[Boundaries](#boundaries) below.

## Layout

```
app/global-configuration/
├── page.js                     # shell: sub-nav + renders the active tab
├── tabs.js                     # ← the tab list. Add a tab here, nowhere else.
├── README.md
│
├── lib/                        # data shared by more than one tab
│   ├── pageRegistry.js         # catalogue of every page in the app
│   └── usePlatformAvailability.js  # stored iPad flags (localStorage)
│
└── components/
    ├── trade-to-phase-codes/   # tab: Trade To Phase Codes Division Association
    │   ├── TradeToPhaseCodes.jsx   # entry component
    │   ├── PhaseCodeTable.jsx      # one range table (General / Shop / Field)
    │   ├── ScopeMappingModal.jsx   # Vista scope code picker
    │   ├── TagList.jsx             # std craft code cells
    │   ├── Tooltip.jsx
    │   └── data.js                 # seed rows + scope code lookup
    │
    └── platform-availability/  # tab: Platform Availability
        ├── PlatformAvailability.jsx  # entry component
        ├── AvailabilityTree.jsx      # card chrome: toolbar + shared column header
        ├── GroupPanel.jsx            # one scope panel, own scrolling body
        ├── IpadNameCell.jsx          # iPad name(s) for a row, incl. page splits
        ├── rows.js                   # registry -> groups + rows, filtering
        └── controls.jsx              # checkbox, toggle, locked web check
```

Each tab is a folder under `components/`. The file named after the tab is its
entry component; everything else in the folder is private to it.

## Adding a tab

1. `mkdir app/global-configuration/components/<your-feature>/`
2. Write `<YourFeature>.jsx` as the entry component.
3. Add one line to `tabs.js`.

`page.js` needs no change.

## Tabs

### Trade To Phase Codes Division Association

Three phase-code range tables — General, Shop, Field — mapping a phase code
prefix range to a trade, its std craft codes, and its Vista scope codes.

### Platform Availability

Which pages are published to the **iPad app**. Every page in the app is a web
page always, so the Web column is locked; the iPad column is the only editable
axis. Scope, section and sub-section header rows carry a cascade checkbox. It is
only ever ticked or empty — a partly-filled group reads as unchecked, so
clicking it turns everything underneath on.

The table lists **sections, sub-sections and pages only**. Functionalities — the
individual actions inside a page — are a permissions concept and stay in
`app/user-management/`; a functionality is never published to a platform on its
own, it ships with its page.

Each published page can carry a **custom iPad page name**, and a page can be
**split into several iPad screens** — the tablet layout isn't always 1:1. "Job
Hub" is one web page but two iPad screens, "Job Hub - Head Count" and "Job Hub -
Productivity". So `mobilePages` is a **list**: one entry per iPad screen, where
an empty entry means "use the web page name". One blank entry is the ordinary
case; `+ Split into another screen` adds more, and numbered rows appear once a
page is split. The toolbar shows the screen count next to the page count
whenever they differ.

The registry stays the web truth — a split is a platform decision, so it lives in
the store rather than inventing web pages that don't exist.

Sub-sections can be renamed too (Daily Production Report → **DPR**), since they
show up as nav groupings on the tablet — but they can't be split.

The screen is **read-only until Edit is pressed**: checkboxes and name fields are
disabled, and the toolbar shows only an Edit button. In edit mode it shows the
unsaved count, Cancel and Save Changes. Cancel throws the draft away and returns
to read-only; Save commits and does the same.

The layout follows the permission screens: one white card whose toolbar holds
the title and the `iPad pages only` toggle on the left, and the count, unsaved
indicator and Save / Discard on the right.

**Job, System and Admin are three panels behaving as an accordion** — all three
bands stay on screen, and opening one closes the others so the open group gets
every pixel the screen can give it. The card fills the viewport and never
scrolls itself; the open panel scrolls its own rows. That's plain flexbox, so it
adapts to the screen size with no measuring.

Column alignment is deliberate and worth not breaking: every table shares
`ColGroup` from `GroupPanel.jsx`, and every column has a fixed pixel width
**except the last**, which is left unsized. A scrolling body is ~15px narrower
than a band that isn't scrolling, and a flexible column soaks that difference up
by shifting everything after it — so the flexible one is last, where there is
nothing after it to shift. That keeps the header, bands and rows lined up while
letting the iPad name column stretch to the full row width. For the same reason
the panels carry no border of their own.

The tab is marked `fills: true` in `tabs.js`, which tells `page.js` to hand it
the full remaining height and not scroll.

Edits are **staged, not live**. `usePlatformAvailability` keeps a draft
alongside what's saved: ticking a box or typing a name only touches the draft,
changed rows get an `unsaved` badge, and Save stays disabled until something
differs. Nothing reaches localStorage until Save Changes, and a `beforeunload`
guard catches a reload with pending edits.

The page list comes from `lib/pageRegistry.js` — **the single place to register
a page**. Add an entry there and it appears in this table automatically. Rows
are grouped as **Job**, **System** and **Admin** pages; `SCOPES` in that file
controls the group order.

Flags are stored per page as an object rather than a bare boolean, so a future
`Off / Read-only / Full` mode, a mobile-specific label, or mobile nav ordering
can be added without migrating stored data.

## Boundaries

**Platform availability is not a permission.** The iPad flag is a property of
the page — has a tablet version been built and shipped? — and no role changes
it. It is edited here, by whoever manages releases.

**Who can open a page** is a property of the user, is edited in
`app/user-management/` (Job Permissions / System Permissions), and changes when
people change. Those screens own that model and do not import from here.

The two are independent on purpose. On the iPad a user sees a page only if it is
published here *and* their role grants them access there.
