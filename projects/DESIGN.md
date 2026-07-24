# TaskFlow Suite — Unified Design System & UI/UX Guidelines

> **Global Source of Truth for Projects 01-04**  
> Covers: `01-task-manager-react`, `02-task-manager-nextjs`, `03-task-manager-htmx`, `04-task-manager-svelte`  
> Formatted according to **ui-ux-pro-max** standards.

---

## 1. Design Vision & Philosophy

TaskFlow is a modern, high-productivity task management suite designed for developers and project managers. The design aesthetic balances **glassmorphism**, **curated dark/light themes**, **rich indigo-to-violet micro-gradients**, and **high-contrast priority badges** to deliver a sleek, state-of-the-art interface across React, Next.js, HTMX, and SvelteKit implementations.

### Core Pillars
- **Visual Elegance**: Glassmorphic headers (`backdrop-blur-md`), subtle borders, rounded containers (`rounded-xl` / `rounded-2xl`), and soft ambient shadows.
- **Theme Parity**: Seamless dark/light theme transitions (`transition-colors duration-200`) adhering to `slate-50` in light mode and `slate-950` in dark mode.
- **Rhythmic Spacing**: Strict 4/8dp spatial grid (`gap-1.5`, `gap-3`, `gap-4`, `p-4`, `p-6`).
- **Semantic Priority System**: Instant visual categorization using color-coded badges (Emerald for Low, Sky for Medium, Amber for High, Rose for Urgent).
- **Framework Independence**: Consistent visual tokens across Client-Side SPAs, SSR, HTMX morphing swaps, and Svelte Runes.

---

## 2. Design Tokens & Color Palettes

### 2.1 Base Color Tokens

| Token | Light Mode Value | Dark Mode Value | Usage |
| :--- | :--- | :--- | :--- |
| `--color-bg-app` | `slate-50` (`#f8fafc`) | `slate-950` (`#020617`) | Main viewport background |
| `--color-bg-card` | `white` with 90% opacity (`#ffffff90`) | `slate-900` with 90% opacity (`#0f172a90`) | Cards, panels, containers |
| `--color-bg-glass` | `rgba(255, 255, 255, 0.75)` | `rgba(15, 23, 42, 0.75)` | Sticky header & floating bars (`backdrop-blur-md`) |
| `--color-border-subtle` | `slate-200/80` (`#e2e8f080`) | `slate-800/80` (`#1e293b80`) | Panel borders, dividers, inputs |
| `--color-text-primary` | `slate-900` (`#0f172a`) | `slate-100` (`#f8fafc`) | Main headings & primary body text |
| `--color-text-secondary` | `slate-600` (`#475569`) | `slate-400` (`#94a3b8`) | Subtitles, labels, secondary info |
| `--color-text-muted` | `slate-400` (`#94a3b8`) | `slate-500` (`#64748b`) | Placeholders, timestamps, disabled items |

### 2.2 Brand & Interactive Gradients

- **Brand Logo Badge**: `bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500` (Text: white)
- **Brand Text Gradient**: 
  - Light: `bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900`
  - Dark: `bg-gradient-to-r from-white via-slate-100 to-indigo-200`
- **Primary CTA Button**: `bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500` (Text: white, Shadow: `shadow-indigo-500/20`)

### 2.3 Priority & Status Palette

```
Priority Tokens:
├── LOW     : Text emerald-600/400 | Bg emerald-500/10 | Border emerald-500/20
├── MEDIUM  : Text sky-600/400     | Bg sky-500/10     | Border sky-500/20
├── HIGH    : Text amber-600/400   | Bg amber-500/10   | Border amber-500/20
└── URGENT  : Text rose-600/400    | Bg rose-500/10    | Border rose-500/20

Status Tokens:
├── TODO        : Indicator slate-400/500 | Header slate-100/900
├── IN_PROGRESS : Indicator amber-500     | Header amber-500/10
└── COMPLETED   : Indicator emerald-500   | Header emerald-500/10
```

---

## 3. Typography & Hierarchy

### Font Family
- **Primary Sans**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `Roboto`, `sans-serif`
- **Monospace**: `"Fira Code"`, `ui-monospace`, `SFMono-Regular`, `Menlo`, `monospace` (used for IDs, dates, fallback loaders)

### Scale & Weight Mapping

| Level | Size Class | Weight | Tracking | Example Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Brand / Title** | `text-lg` / `text-xl` | `font-extrabold` | `tracking-tight` | Header logo, page titles |
| **Section Header** | `text-base` / `text-lg` | `font-bold` | `tracking-tight` | Board column headers, modal titles |
| **Card Title** | `text-sm` / `text-base` | `font-bold` | Normal | Task item titles |
| **Body Text** | `text-xs` / `text-sm` | `font-normal` | Normal | Task descriptions, descriptions |
| **Nav & Controls** | `text-xs` | `font-semibold` | Normal | Navigation pills, buttons, input fields |
| **Badges & Tags** | `text-[10px]` / `text-xs` | `font-bold` | `tracking-wider` | Priority pills, category tags |

---

## 4. Layout, Surface & Micro-Animations

### Glassmorphism & Surface Specification
```css
/* Glass Panel Specification */
.glass-panel {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.dark .glass-panel {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
```

### Micro-Animations & Keyframes
- **Modal Scale & Fade-In**:
  ```css
  @keyframes fadeInScale {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fade-in-scale {
    animation: fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  ```
- **Button Active Press State**: `active:scale-95 transition-transform duration-150`
- **Card Hover State**: `hover:border-indigo-500/30 hover:shadow-md transition-all duration-200`
- **Nav Pill Active State**: `bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold`

---

## 5. Iconography & Interaction Rules

### Icon Guidelines (`/ui-ux-pro-max` Standard)
1. **No Structural Emojis**: Never use emoji characters (e.g., 📝, ⚙️, 🚀) as navigation or control icons. Use vector icons exclusively (Lucide React, Lucide Svelte, or SVG sprites).
2. **Stroke Consistency**: Maintain uniform line stroke width (`1.5px` to `2px`) across all interface icons.
3. **Icon Size Tokens**:
   - Small (`w-3.5 h-3.5`): Inline text badges, nav item prefixes, search inputs.
   - Medium (`w-4 h-4`): Buttons, card actions, header toggles.
   - Large (`w-5 h-5` / `w-6 h-6`): Modal header icons, empty state illustrations.
4. **Touch Target Area**: Ensure interactive icons have a tap area of at least **44×44px** (using padding or `hitSlop`).

---

## 6. Shared Component Specifications Across 01-04

### 6.1 Navigation Header (`NavigationHeader`)
- **Structure**: Sticky container with `.glass-panel` and bottom border `border-slate-200/80 dark:border-slate-800/80`.
- **Left**: Brand logo with `TM` rounded gradient box + `TaskFlow` text gradient + Nav pill container (`bg-slate-100/80 dark:bg-slate-950/80 p-1 rounded-xl`).
- **Right**: Search bar (`bg-slate-100/90 dark:bg-slate-950/90 rounded-xl`), Sun/Moon theme toggle button, "+ New Task" primary CTA button.

### 6.2 Kanban Board View (`KanbanBoard`)
- **Grid Layout**: 3 columns (`Todo`, `In Progress`, `Completed`) with equal width (`flex-1`).
- **Column Header**: Rounded top container with color-coded count pill (e.g. `bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300`).
- **Task Card**: `bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all`.
  - Header: Category pill + Priority badge.
  - Body: Task Title + Description preview (truncated line-clamp-2).
  - Footer: Due date indicator + Edit/Delete actions.

### 6.3 Task List View (`TaskList`)
- **Layout**: Data table or structured card list.
- **Controls**: Filter by Priority dropdown, Filter by Status dropdown, Sort selector, Search filter indicator pills.
- **Row Styling**: Alternating hover highlights (`hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors`).

### 6.4 Task Form Modal (`TaskFormModal`)
- **Backdrop**: Fixed inset screen overlay with `bg-slate-950/60 backdrop-blur-xs`.
- **Dialog Panel**: Centered container with `animate-fade-in-scale`, `max-w-lg`, `rounded-2xl`, `bg-white dark:bg-slate-900`, `border border-slate-200 dark:border-slate-800`, `shadow-2xl`.
- **Inputs**: `bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500`.

---

## 7. Framework Implementation Mapping (Projects 01 - 04)

All four projects implement the exact design tokens above using their respective stack paradigms:

```
projects/
├── 01-task-manager-react/
│   ├── Styling: Tailwind v4 + index.css (@import "tailwindcss", @custom-variant dark)
│   ├── State: Zustand (store/useTaskStore.ts) + ThemeContext
│   └── Component Library: React 19 + Lucide React + @hello-pangea/dnd
│
├── 02-task-manager-nextjs/
│   ├── Styling: Tailwind v4 + App Router globals.css
│   ├── State: React Context + Server Actions / LocalStorage Sync
│   └── SSR Handling: Inline theme script in layout.tsx to prevent FOUC
│
├── 03-task-manager-htmx/
│   ├── Styling: Tailwind CSS CDN / CLI output matching index.css tokens
│   ├── Templating: Jinja2 Templates (FastAPI) / HTMX hx-target morphs
│   └── Interactivity: inline SVG icons + dark mode class toggler JS snippet
│
└── 04-task-manager-svelte/
    ├── Styling: Tailwind CSS + app.css
    ├── State: Svelte 5 Runes ($state, $effect) + theme readable/writable store
    └── Component Library: Svelte 5 + Lucide Svelte + svelte-dnd-action
```

---

## 8. Pre-Delivery UI/UX Checklist

Before finalizing any frontend project (01-04), verify compliance against this list:

- [x] **Theme Consistency**: Light mode (`slate-50`) and Dark mode (`slate-950`) function flawlessly without broken contrast.
- [x] **No Hardcoded Hex Colors**: All surface, text, and border colors use semantic `slate`, `indigo`, `emerald`, `sky`, `amber`, or `rose` tokens.
- [x] **No Structural Emojis**: All buttons, navigation tabs, and system status indicators use SVG vector icons.
- [x] **Glassmorphism Parity**: Headers and floating overlays utilize `.glass-panel` backdrop blur (`12px`).
- [x] **Accessibility (a11y)**:
  - Contrast ratio >= 4.5:1 for body text and >= 3:1 for graphical UI elements.
  - Interactive elements have explicit `aria-label` or visible text labels.
  - Focus rings are visible during keyboard navigation (`focus:ring-2 focus:ring-indigo-500/50`).
- [x] **Responsive Breakdown**: Verified on mobile (`375px`), tablet (`768px`), and desktop (`1280px+`).