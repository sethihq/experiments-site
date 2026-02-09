# Design Alignment Plan - Match gxuri.in & skiper-ui.com

## Analysis Summary

After analyzing both reference codebases, here are the key differences to address:

---

## 1. CSS Variables & Design Tokens

### Current (Our Site)
```css
/* Using hardcoded values like */
bg-[#ededed]/[0.03]
text-[#ededed]/70
border-[#ededed]/[0.06]
```

### Reference Sites Use
```css
/* CSS Custom Properties */
--background: #080808;
--foreground: #ededed;
--muted: <color>;
--muted2, --muted3, --muted4: <opacity variants>;
--border: <color>;
--radius-2xl: 1rem;
--radius-3xl: 1.5rem;
```

### Action Items
- [ ] Create CSS variables in globals.css for consistent theming
- [ ] Replace hardcoded colors with CSS variables
- [ ] Use color-mix() for opacity variants

---

## 2. Layout Dimensions

### Sidebar
| Property | Reference | Ours | Fix |
|----------|-----------|------|-----|
| Width | 320px | 320px | ✓ OK |
| Padding | p-4 | p-4 | ✓ OK |
| Border radius | rounded-3xl (1.5rem) | rounded-3xl | ✓ OK |

### Info Panel
| Property | Reference | Ours | Fix |
|----------|-----------|------|-----|
| Width | ~400-420px | 420px | ✓ OK |
| Background | #0a0a0a | #0a0a0a | ✓ OK |

### Top Bar
| Property | Reference | Ours | Fix |
|----------|-----------|------|-----|
| Button size | 42x42px | 42px | ✓ OK |
| Position | Fixed top-right | Fixed top-4 right-4 | ✓ OK |
| Gap | gap-1 | gap-1 | ✓ OK |

---

## 3. Typography

### Reference Fonts
- **Primary**: Inter (with variable optical sizing)
- **Mono**: Geist Mono, Roboto Mono
- **Serif**: Instrument Serif (for italic accents)
- **Display**: SF Pro Display

### Our Fonts
- Geist Sans ✓
- Geist Mono ✓
- Instrument Serif ✓

### Action Items
- [ ] Ensure font-optical-sizing is enabled
- [ ] Match text sizes: xs (0.75rem), sm (0.875rem), base (1rem)

---

## 4. Animation & Transitions

### Reference Values
```css
--default-transition-duration: 0.15s;
--default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* Spring animations (Framer Motion) */
damping: 25
stiffness: 200
```

### Our Values
We're already using `damping: 25, stiffness: 200` ✓

---

## 5. Component-Specific Fixes

### A. Gallery Page (/)

**Issues:**
- Header alignment and spacing
- Card hover states
- Grid gap consistency

**Reference Pattern:**
- Header: 20vh margin-top, 10vh margin-bottom
- Grid: 3 columns on desktop, gap-4
- Cards: hover:border-[muted]/20, rounded-2xl

### B. Experiment Page (/exp/[id])

**Issues:**
- Sidebar toggle button position refinement
- Info panel scroll behavior
- Footer navigation styling

**Reference Pattern:**
- Sidebar toggle: left-4, top with mt-[35.5px]
- Fade gradients on sidebar (top and bottom)
- Prev/Next buttons with hover states

### C. Navigation

**Reference Pattern:**
- Pill-style nav: rounded-full, bg with 2% opacity
- Active state: bg-[foreground]/8%, font-medium
- Hover: text-[foreground]/70, bg-[foreground]/3%

---

## 6. Specific Patterns to Implement

### A. Fade Gradients (Sidebar Scroll)
```css
.sidebar-fade-top {
  --blur: 4px;
  --stop: 25%;
  background: linear-gradient(to top, transparent, var(--background));
  mask-image: linear-gradient(to bottom, var(--background) var(--stop), transparent);
  backdrop-filter: blur(var(--blur));
}
```

### B. Code Block Styling
```tsx
// Reference uses:
- font-size: 12px
- font-family: Geist Mono
- background: transparent
- line numbers with padding
```

### C. Section Headers
```tsx
// Pattern:
<div className="flex items-center gap-4 mb-4">
  <h3 className="text-xs font-medium uppercase tracking-wider opacity-40">
    {title}
  </h3>
  <span className="flex-1 h-px bg-[foreground]/10" />
</div>
```

---

## 7. Implementation Priority

### Phase 1: CSS Foundation
1. Add CSS custom properties to globals.css
2. Create opacity utility classes
3. Update tailwind.config for theme tokens

### Phase 2: Layout Refinements
1. Fine-tune sidebar dimensions and positioning
2. Adjust info panel scroll and fade behavior
3. Fix card hover/focus states

### Phase 3: Component Polish
1. Update navigation pill styling
2. Refine code blocks in info panel
3. Add missing hover states and transitions

### Phase 4: Animations
1. Review all spring animations
2. Add stagger animations on gallery
3. Smooth page transitions

---

## 8. Files to Modify

1. `src/app/globals.css` - Add CSS variables
2. `src/app/page.tsx` - Gallery layout fixes
3. `src/app/exp/[id]/page.tsx` - Experiment viewer refinements
4. `src/components/experiment-info.tsx` - Info panel improvements
5. `src/components/gallery-card.tsx` - Card hover states
6. `src/components/settings-panel.tsx` - Settings UI polish

---

## Next Steps

1. Start with CSS variables in globals.css
2. Update components one by one
3. Test on multiple screen sizes
4. Compare side-by-side with reference sites
