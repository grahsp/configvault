---
name: KeyVault
description: A restrained product dashboard for small developer teams managing secrets and configuration.
colors:
  background: "#f6f7f9"
  foreground: "#151d28"
  card: "#fcfcfd"
  primary: "#38749f"
  primary-foreground: "#f8fbfb"
  secondary: "#e7ebee"
  muted: "#edf0f2"
  muted-foreground: "#575f6b"
  accent: "#dceaf4"
  accent-foreground: "#1b435f"
  destructive: "#b9313a"
  border: "#d0d6dd"
  dark-background: "#121721"
  dark-foreground: "#e6ebef"
  dark-card: "#19202b"
  dark-primary: "#4dc7bf"
  dark-secondary: "#282e39"
  dark-muted: "#262c36"
  dark-muted-foreground: "#a4acb7"
  dark-accent: "#274947"
  dark-accent-foreground: "#aae4e0"
  dark-border: "#343b46"
typography:
  display:
    fontFamily: "Geist Variable, Avenir Next, Segoe UI, ui-sans-serif, system-ui, sans-serif"
    fontSize: "text-5xl to text-[4.5rem]"
    fontWeight: 600
    lineHeight: 0.98
  headline:
    fontFamily: "Geist Variable, Avenir Next, Segoe UI, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.1rem to 1.25rem"
    fontWeight: 600
    lineHeight: 1.25
  title:
    fontFamily: "Geist Variable, Avenir Next, Segoe UI, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Geist Variable, Avenir Next, Segoe UI, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist Variable, Avenir Next, Segoe UI, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem to 0.875rem"
    fontWeight: 500
    lineHeight: 1.25
rounded:
  none: "0px"
  md: "8px"
  md-lg: "10px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.none}"
    height: "36px"
    padding: "0 12px"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    height: "36px"
    padding: "0 12px"
  input-default:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md-lg}"
    height: "48px"
    padding: "12px 16px"
  panel:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
---

# Design System: KeyVault

## 1. Overview

**Creative North Star: "The Control Room Ledger"**

KeyVault's product UI is a serious, minimal dashboard for teams that touch sensitive configuration every day. The system should feel calm, precise, and operational: a place where project context, environment context, member access, and secret state are always legible.

The default register is product. The landing page uses a separate brand-like surface with larger type, rounded feature cards, and brighter sky accents; it should not drive the default dashboard language. Product screens should follow the shadcn/Radix vocabulary already in the app: compact buttons, layered neutral surfaces, clear focus rings, restrained color, and direct table or list workflows.

**Key Characteristics:**
- Dense but readable dashboards with strong context breadcrumbs and compact controls.
- Cool slate neutrals, sky-blue primary actions, and a pale blue wash as a restrained contextual accent.
- Borders and tonal surfaces do most of the layering; shadows are rare and soft.
- State is explicit for loading, disabled, destructive, invalid, pending, revealed, and marked-for-deletion flows.

## 2. Colors

The product palette is a restrained Slate + Sky Blue dashboard system: cool slate neutrals carry the work surface and controls, sky blue identifies light-mode primary action and focus, dark mode keeps a brighter green-teal signal, and a low-chroma blue wash supports selected or contextual states without turning decorative.

### Primary
- **Operational Blue** (`primary`, `#38749f` light; `#4dc7bf` dark): primary buttons, selected tabs, active path selectors, links, focus-adjacent emphasis, and scarce action highlights. Light mode uses a low-chroma sky blue tuned dark enough for light text; dark mode keeps the brighter green-teal signal.

### Secondary
- **Blue Wash Context** (`accent`, `#dceaf4` light; `#274947` dark): low-urgency contextual emphasis, selected-subtle surfaces, and calm state backgrounds. Use sparingly so it remains informative.

### Neutral
- **Slate Work Surface** (`background`, `#f6f7f9` light; `#121721` dark): application shell, centered work surface, gutters, and page base.
- **Raised Paper** (`card`, `#fcfcfd` light; `#19202b` dark): popovers, panels, dialogs, and framed controls.
- **Muted Control Surface** (`muted`, `#edf0f2` light; `#262c36` dark): hover states, inputs, subdued panels, table row states, and empty-state surfaces.
- **Ink Foreground** (`foreground`, `#151d28` light; `#e6ebef` dark): primary text and high-confidence labels.
- **Quiet Metadata** (`muted-foreground`, `#575f6b` light; `#a4acb7` dark): helper text, timestamps, secondary labels, and unavailable context.
- **Clean Divider** (`border`, `#d0d6dd` light; `#343b46` dark): structural separation, table rows, nav bars, inputs, and popover edges.

### Tertiary
- **Risk Red** (`destructive`, `#b9313a` light; `#db7679` dark): destructive actions, invalid fields, deletion marks, and dangerous confirmations.
- **Status Overrides** (`--color-warning`, `--color-text-success`, `--color-text-pink`): warning uses restrained ochre (`hsl(38 52% 37%)` light; `hsl(42 60% 72%)` dark), success uses muted green (`hsl(154 30% 30%)` light; `hsl(154 34% 70%)` dark), and pink uses reserved role color (`hsl(335 30% 44%)` light; `hsl(335 35% 74%)` dark). Use only for status semantics.

### Named Rules
**The One Accent Rule.** Blue is the only default light-mode product accent. The wash and status colors must stay semantic and rare.

**The Landing Exception Rule.** Sky accents, oversized rounded cards, and dark hero composition belong to the landing page unless a future task explicitly targets a brand surface.

## 3. Typography

**Display Font:** Geist Variable with Avenir Next, Segoe UI, and system sans fallbacks.  
**Body Font:** Geist Variable with the same sans stack.  
**Label/Mono Font:** Tailwind `font-mono` for secret values, import textareas, and machine-readable content.

**Character:** Typography is modern and quiet, with weight and spacing doing more work than decorative type. Product screens should favor compact line heights, clear labels, and short headings over hero-scale display.

### Hierarchy
- **Display** (600, `text-5xl` to `text-[4.5rem]`, `0.98`): landing-page hero only.
- **Headline** (600 to 700, `1.1rem` to `1.25rem`, tight): project names, page-level anchors, modal titles, and list row names.
- **Title** (600, `1rem`, comfortable): section headers, dialog titles, and component headers.
- **Body** (400, `0.9rem` to `1rem`, `1.5`): operational copy, table content, row descriptions, and form text. Keep longer prose near 65 to 75 characters.
- **Label** (500 to 600, `0.75rem` to `0.875rem`): field labels, compact metadata, tab labels, and uppercase table-style labels. Use tracking only for tiny uppercase labels.

### Named Rules
**The Product Scale Rule.** Keep app UI type compact. Reserve landing-scale type and negative tracking for the landing page.

## 4. Elevation

KeyVault is flat by default and uses tonal layering more than shadows. Depth comes from background shifts, borders, sticky nav blur, and popover/dialog framing. Shadows appear only where they clarify a floating layer or a branded landing card.

### Shadow Vocabulary
- **Panel Soft** (`0 10px 24px hsl(var(--foreground) / 0.07)`): rare product panels that need separation from similar neutral surfaces.
- **Dialog Large** (`shadow-lg`): centered dialogs and overlays.
- **Nav Skeleton** (`0 1px 2px hsl(var(--foreground) / 0.05)`): tiny utility depth for account-loading affordances.
- **Landing Feature Shadow** (`0 16px 40px rgba(...)`): landing-page only, not a product dashboard default.

### Named Rules
**The Flat-By-Default Rule.** Prefer borders and tonal surfaces before shadows. A resting dashboard should not look lifted, glossy, or glassy.

## 5. Components

### Buttons
- **Shape:** Product buttons use squared shadcn-style corners by default (`rounded-none`), with icon buttons sized at 24, 32, 36, or 40px.
- **Primary:** Blue or teal background with light foreground, `h-9`, compact horizontal padding, and medium weight.
- **Hover / Focus:** Hover darkens or mutes the same semantic color. Focus uses visible ring treatment (`ring-3 ring-ring/30`) and a border shift where applicable.
- **Secondary / Ghost / Outline:** Secondary uses muted surfaces, outline uses background plus border, and ghost buttons stay transparent until hover. Destructive buttons use red-tinted backgrounds rather than fully saturated red except for high-commitment moments.

### Chips
- **Style:** Treat tabs, path selectors, environment selectors, and compact badges as control chips rather than decorative pills.
- **State:** Selected state should be visible through text strength, underline, border, or primary accent. Do not rely on color alone.

### Cards / Containers
- **Corner Style:** Product containers use 8 to 10px radii when framed. Avoid the landing page's large rounded feature-card radius in app screens.
- **Background:** Use card, background, muted, and contrast-subtle surfaces to build layers.
- **Shadow Strategy:** Follow the Flat-By-Default Rule.
- **Border:** Use `border`, `border/60`, `border/80`, or soft semantic borders for structure.
- **Internal Padding:** Use compact dashboard spacing: 16px for dense sections, 24px for dialog and panel content, 40px for page rhythm.

### Inputs / Fields
- **Style:** Inputs use muted background, soft border, 10px radius, 48px default height, 16px horizontal padding, and strong text color.
- **Focus:** Focus moves to primary/ring treatment with a visible ring, commonly `ring-3 ring-ring/20` or `ring-2 ring-primary/30`.
- **Error / Disabled:** Invalid fields use destructive border and ring. Disabled controls reduce opacity and must remain legible.
- **Secret Values:** Secret values and imports use mono treatment. Reveal, edit, copy, and delete actions should remain close to the value being acted on.

### Navigation
- **App Navbar:** Sticky top bar, subtle border, high-opacity background, and backdrop blur. Brand text is compact uppercase; app links use border-bottom active state.
- **Project Navigation:** Breadcrumb-like path selectors carry project and environment context. Subnav tabs use a compact 40px height and a 2px underline for active state.
- **Mobile Treatment:** Preserve hierarchy and control access without adding marketing-style spacing.

### Tables / Lists
- **Rows:** Dense row spacing, border or tiny gap separation, hover via muted background, and clear selected/expanded states.
- **Headers:** Compact semibold labels. Avoid monotonous gray data grids by using row grouping, inline controls, and state-specific affordances.
- **Empty / Loading States:** Keep them utilitarian. State what is unavailable and provide the next direct action.

### Dialogs / Popovers
- **Dialogs:** Use focused forms for creation, invitation, confirmation, import, and history workflows. Keep copy short and actions explicit.
- **Popovers / Menus:** Use shadcn/Radix menu patterns, compact item padding, destructive variants for dangerous actions, and clear keyboard focus.

## 6. Do's and Don'ts

### Do:
- **Do** build new product UI from the existing shadcn-style primitives, Tailwind utilities, semantic CSS variables, and `@/` imports.
- **Do** keep screens dense but readable, with 16px to 24px local spacing and page-level rhythm around 40px.
- **Do** use the primary accent sparingly for active context, focus, and high-value actions.
- **Do** show ownership and action states clearly for projects, environments, members, invites, secrets, unsaved edits, and destructive flows.
- **Do** keep focus states visible, labels accessible, and status communication independent from color alone.

### Don't:
- **Don't** make product screens feel like enterprise-heavy admin tooling, bureaucratic density, gray-table monotony, or compliance-tool clutter.
- **Don't** borrow the landing page's oversized hero type, sky accent, round feature cards, or marketing composition for normal dashboard screens.
- **Don't** add decorative gradients, glassmorphism, heavy shadows, or large-radius card grids to the product UI.
- **Don't** use border-left or border-right colored stripes wider than 1px as an alert or card accent.
- **Don't** hide risky state changes behind vague copy; deletion, reveal, revoke, and role changes need direct language and clear controls.
