# File Reference — What Each File Does

Each file is described in 2–3 bullet points. **App-specific** code is under `src/`; **shared UI** components are in `src/components/ui/` (shadcn-style primitives).

---

## Root & config

**`package.json`**
- Declares project name, scripts (`dev`, `build`, `lint`, `preview`), and all npm dependencies.
- Lists React, Vite, Tailwind, Radix UI, TanStack Query, React Router, and app libs (e.g. sonner, recharts, zod).

**`index.html`**
- Single HTML shell for the SPA: sets page title, meta (description, OG, Twitter), and canonical URL.
- Mounts the app by loading `/src/main.tsx` and renders into the `#root` div.

**`vite.config.ts`**
- Configures Vite: React (SWC) plugin, dev server host/port (e.g. 8080), and path alias `@` → `./src`.

**`tsconfig.json`**
- Root TypeScript config: references `tsconfig.app.json` and `tsconfig.node.json`, sets `paths` for `@/*` and relaxed strictness for the app.

**`tsconfig.app.json`**
- TypeScript config for `src/`: target ES2020, JSX, module resolution for bundler, path alias `@/*` → `./src`.

**`tsconfig.node.json`**
- TypeScript config for Node/tooling (e.g. `vite.config.ts`): target ES2022, strict mode, includes only Vite config.

**`tailwind.config.ts`**
- Tailwind theme: content paths, design tokens (colors, radius, sidebar), custom keyframes/animations, and `tailwindcss-animate`.

**`postcss.config.js`**
- PostCSS config: runs Tailwind and Autoprefixer on CSS.

**`eslint.config.js`**
- Flat ESLint config: JS/TS recommended, React Hooks and React Refresh, applies to `**/*.{ts,tsx}`, ignores `dist`.

**`components.json`**
- shadcn/ui schema: style, paths for Tailwind and CSS, and aliases for `@/components`, `@/lib`, `@/hooks` (used by CLI when adding components).

**`.gitignore`**
- Ignores build output, dependencies, env files, IDE/OS files, and other generated or local paths.

---

## Public

**`public/robots.txt`**
- Allows all crawlers (e.g. Googlebot, Bingbot, Twitterbot, facebookexternalhit, `*`) to access the site; no disallow rules.

---

## Source — entry & app shell

**`src/main.tsx`**
- App entry: creates React root, mounts `<App />` into `#root`, and imports global `index.css`.

**`src/App.tsx`**
- Root component: wraps app in QueryClient, TooltipProvider, DemoProvider, Toaster + Sonner, and BrowserRouter.
- Defines routes (Landing, Customer, Seller, Admin, Inspection, NotFound) and a shared layout with `AppSidebar` and main content area.

**`src/vite-env.d.ts`**
- TypeScript reference for Vite client types (e.g. `import.meta.env`) so TS understands Vite globals.

**`src/index.css`**
- Global styles: Tailwind layers, CSS variables for theming (light/dark, colors, radius, sidebar), custom utility classes (e.g. gradients, animations), and Inter font import.

---

## Source — pages

**`src/pages/Landing.tsx`**
- Marketing home: hero (“Automated Smart Returns Inspection”), feature grid (Item Received → Robotic Scanning → AI Analysis → Instant Results), demo section with robotic animation, and CTA linking to Customer, Seller, Admin, and Inspection.

**`src/pages/CustomerPortal.tsx`**
- Customer return flow: form (name, order ID, item, reason, type, optional photo/video), submit creates a return in DemoContext and shows inspection progress (stages 1–5), then “View Inspection Results” navigates to Inspection.

**`src/pages/SellerPortal.tsx`**
- Seller view: table of returns (customer, product, fraud score, status, time remaining, actions) with search and status filter, summary stats (Total/Approved/Flagged/Rejected), and pagination; merges context returns with mock data.

**`src/pages/AdminDashboard.tsx`**
- Admin view: stat cards (returns today, fraud rate, avg inspection time, pending review), inspection pipeline visualization, live activity feed, fraud threshold slider, Manual Review Queue (flagged items), and quick actions (Override, Add Notes, Analytics); uses mock + context returns.

**`src/pages/InspectionSimulation.tsx`**
- Inspection demo: run/pause/reset inspection, 5-stage progress bar, robotic arm animation, AI findings list, and final summary (fraud score, decision badge, analysis text); can use `activeInspection` from context or generate a new score locally.

**`src/pages/NotFound.tsx`**
- 404 page: shows “Page not found” and a link back home; logs 404 path to console (for debugging).

---

## Source — context & data

**`src/context/DemoContext.tsx`**
- Demo state: holds `returns` list, `activeInspection`, and demo flags (`isDemo`, `isDemoRunning`, `currentDemoStep`).
- Exposes `addReturn`, `updateReturn`, `setActiveInspection`, `advanceInspectionStage`, `startDemo`, `stopDemo`; generates fraud score and status for new returns and drives inspection stage progression.

**`src/utils/fraudLogic.ts`**
- Domain logic: `ReturnItem` type, `generateFraudScore()` (mock random), `getStatusFromScore()` (approved/flagged/rejected by score bands), `getStatusColor` / `getStatusBgColor`, `formatTimeRemaining`, inspection stage labels, return reasons list, and `generateMockReturns()` for demo data.

---

## Source — lib & hooks

**`src/lib/utils.ts`**
- Shared util: `cn()` helper built from `clsx` + `tailwind-merge` for conditional Tailwind class names (used across components).

**`src/hooks/use-toast.ts`**
- Toast state and API: manages toast list, `toast()` to add/dismiss toasts, and `useToast()` to read toasts; powers the shadcn Toaster (radix-based).

**`src/hooks/use-mobile.tsx`**
- Responsive hook: returns whether viewport is below 768px (mobile); used for layout/toggles that depend on screen size.

---

## Source — app-specific components

**`src/components/AppSidebar.tsx`**
- Main nav: logo (“ReturnGuard”), links to Home, Customer, Seller, Admin, Inspection; active state from route; mobile overlay and toggle; “Start/Stop Demo Mode” button that uses DemoContext.

**`src/components/NavLink.tsx`**
- Wrapper around React Router `NavLink`: forwards ref and supports `className`, `activeClassName`, `pendingClassName` for styling active/pending states (not used by AppSidebar currently).

**`src/components/CountdownTimer.tsx`**
- Displays time left until `expiresAt`: countdown (HH:MM:SS), progress bar over 72h window, and “Expired” state when past; used in Seller portal for return deadline.

**`src/components/FraudScoreMeter.tsx`**
- Circular gauge for fraud score (0–100): color by band (green / yellow / red), sizes sm/md/lg; used in Seller, Admin, and Inspection to show risk at a glance.

**`src/components/InspectionProgress.tsx`**
- Horizontal 5-stage progress: labels from `fraudLogic` stages, checkmarks for completed, pulse for current; used in Customer (post-submit) and Inspection Simulation.

**`src/components/RoboticArmAnimation.tsx`**
- Visual “robot inspecting package”: box, arm, scan line, stage badges (Scanning/Verifying/Analyzing); used on Landing and in Inspection/Admin to convey automated inspection.

**`src/components/StatCard.tsx`**
- Dashboard metric card: title, value, optional subtitle, icon, trend (up/down/neutral), and variant (default/primary/success/warning/destructive); used on Admin for returns today, fraud rate, inspection time, pending review.

---

## Source — UI components (shadcn-style)

These are reusable primitives from or compatible with shadcn/ui; they provide accessible, themed building blocks.

**`src/components/ui/accordion.tsx`** — Expandable/collapsible sections (Radix Accordion).

**`src/components/ui/alert.tsx`** — Alert box for messages (e.g. info, warning), with optional title and variant.

**`src/components/ui/alert-dialog.tsx`** — Modal dialog for confirmations (e.g. destructive actions) with cancel/confirm.

**`src/components/ui/aspect-ratio.tsx`** — Wrapper that enforces an aspect ratio (e.g. 16/9) for content.

**`src/components/ui/avatar.tsx`** — User avatar with image/fallback initials.

**`src/components/ui/badge.tsx`** — Small status/chip with variants (default, secondary, destructive, outline, success, warning, info).

**`src/components/ui/breadcrumb.tsx`** — Breadcrumb navigation with separator and link styling.

**`src/components/ui/button.tsx`** — Button with many variants (default, destructive, outline, secondary, ghost, link, accent, hero, success) and sizes (sm, default, lg, xl, icon); uses CVA and Radix Slot.

**`src/components/ui/calendar.tsx`** — Date picker calendar (e.g. react-day-picker) for selecting dates.

**`src/components/ui/card.tsx`** — Card container: CardHeader, CardTitle, CardDescription, CardContent, CardFooter.

**`src/components/ui/carousel.tsx`** — Horizontal carousel/slider (e.g. Embla) for swipeable content.

**`src/components/ui/chart.tsx`** — Chart wrapper (Recharts) with theme-aware colors for graphs.

**`src/components/ui/checkbox.tsx`** — Checkbox input (Radix) with label styling.

**`src/components/ui/collapsible.tsx`** — Collapsible section (Radix) that toggles content visibility.

**`src/components/ui/command.tsx`** — Command palette / combobox (cmdk) for searchable lists and shortcuts.

**`src/components/ui/context-menu.tsx`** — Right-click context menu (Radix) with items and separators.

**`src/components/ui/dialog.tsx`** — Modal dialog (Radix) with overlay, title, description, and content area.

**`src/components/ui/dropdown-menu.tsx`** — Dropdown menu (Radix) with items, checkboxes, radio items, submenus, separators.

**`src/components/ui/form.tsx`** — Form helpers: Form components wired to react-hook-form and optional zod validation (Label, Field, error display).

**`src/components/ui/hover-card.tsx`** — Hover card / popover on hover (Radix) for extra info.

**`src/components/ui/input.tsx`** — Text input field with theme styling.

**`src/components/ui/input-otp.tsx`** — OTP/pin input (input-otp) as separate digit boxes.

**`src/components/ui/label.tsx`** — Accessible label for form controls (Radix Label).

**`src/components/ui/menubar.tsx`** — Horizontal menu bar with dropdowns (Radix Menubar).

**`src/components/ui/navigation-menu.tsx`** — Nav menu with links and optional dropdowns (Radix NavigationMenu).

**`src/components/ui/pagination.tsx`** — Pagination controls (prev/next, page numbers).

**`src/components/ui/popover.tsx`** — Popover (Radix) that anchors content to a trigger.

**`src/components/ui/progress.tsx`** — Progress bar showing a percentage (Radix Progress).

**`src/components/ui/radio-group.tsx`** — Radio button group (Radix) for single choice.

**`src/components/ui/resizable.tsx`** — Resizable panels (react-resizable-panels) with drag handles.

**`src/components/ui/scroll-area.tsx`** — Themed scrollable area (Radix ScrollArea) with custom scrollbar.

**`src/components/ui/select.tsx`** — Select dropdown (Radix Select) with trigger, value display, and options.

**`src/components/ui/separator.tsx`** — Horizontal or vertical divider (Radix Separator).

**`src/components/ui/sheet.tsx`** — Slide-out panel from edge (Vaul/drawer) for side panels or mobile menus.

**`src/components/ui/sidebar.tsx`** — Sidebar layout primitives (e.g. SidebarProvider, SidebarInset) for app chrome.

**`src/components/ui/skeleton.tsx`** — Skeleton placeholder for loading states.

**`src/components/ui/slider.tsx`** — Slider input (Radix) for numeric range (e.g. fraud threshold).

**`src/components/ui/sonner.tsx`** — Sonner toaster wrapper: renders Sonner with theme and custom classNames; re-exports `Toaster` and `toast` (used for success/error in app).

**`src/components/ui/table.tsx`** — Table primitives: Table, TableHeader, TableBody, TableRow, TableHead, TableCell for data tables.

**`src/components/ui/tabs.tsx`** — Tabbed content (Radix Tabs) with list and panels.

**`src/components/ui/textarea.tsx`** — Multi-line text input with theme styling.

**`src/components/ui/toast.tsx`** — Single toast item UI (Radix Toast): title, description, close, viewport; used by Toaster.

**`src/components/ui/toaster.tsx`** — Renders the list of toasts from `useToast()` inside ToastProvider/ToastViewport (shadcn toast system).

**`src/components/ui/toggle.tsx`** — Toggle button (Radix Toggle) for on/off state.

**`src/components/ui/toggle-group.tsx`** — Group of toggle buttons with single or multiple selection (Radix).

**`src/components/ui/tooltip.tsx`** — Tooltip (Radix) and TooltipProvider for hover hints.

**`src/components/ui/use-toast.ts`** — Re-exports `useToast` and `toast` from `@/hooks/use-toast` so UI imports stay under `@/components/ui`.

---

## Summary

- **Config:** Vite + React + TypeScript + Tailwind + ESLint + shadcn schema.
- **App:** Single-page app with React Router; DemoContext holds demo returns and inspection state; fraudLogic defines types and mock scoring.
- **Pages:** Landing (marketing), Customer (submit return + progress), Seller (returns table + fraud scores), Admin (pipeline + threshold + review queue), Inspection (simulation), NotFound (404).
- **UI:** Shared `cn` util and many shadcn-style components in `components/ui`; app-specific pieces (sidebar, fraud meter, inspection progress, robot animation, stat card, countdown) live in `components/` and `hooks/`.
