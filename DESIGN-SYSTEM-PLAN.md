# Design System Plan
> Inspired by [MaximeHeckel/design-system](https://github.com/MaximeHeckel/design-system)

## Current State Analysis

### What We Have
- CSS variables for colors, spacing, radii, transitions in `globals.css`
- Components scattered in `/src/components/`
- No unified component patterns
- No reusable primitives (Box, Flex, Text, etc.)
- Inline styles mixed with Tailwind

### What MaximeHeckel Does Well
1. **Primitive Components**: Box, Flex, Grid as base layout components
2. **Composition Pattern**: Card.Header, Card.Body sub-components
3. **Token System**: Shadows, colors, spacing as exportable tokens
4. **Hooks**: useKeyboardShortcut, useTheme, useDebouncedValue
5. **Type Safety**: Strong TypeScript with VariantProps

---

## Implementation Plan

### Phase 1: Design Tokens
Extend our current CSS variables with a complete token system.

```
src/
├── lib/
│   ├── tokens/
│   │   ├── colors.ts       # Color palette exports
│   │   ├── shadows.ts      # Shadow elevation system
│   │   ├── spacing.ts      # Spacing scale
│   │   └── index.ts        # Unified exports
│   └── cn.ts               # Utility for className merging
```

#### Shadow Tokens (from MaximeHeckel)
```css
--shadow-color: 0 0% 0%;
--shadow-1: 0.5px 1px 1px hsl(var(--shadow-color) / 0.33);
--shadow-2: 1px 2px 2px hsl(var(--shadow-color) / 0.33),
            2px 4px 4px hsl(var(--shadow-color) / 0.33);
--shadow-3: 1px 2px 2px hsl(var(--shadow-color) / 0.2),
            2px 4px 4px hsl(var(--shadow-color) / 0.2),
            4px 8px 8px hsl(var(--shadow-color) / 0.2),
            8px 16px 16px hsl(var(--shadow-color) / 0.2),
            16px 32px 32px hsl(var(--shadow-color) / 0.2);
```

#### Spacing Scale
```css
--space-0: 0;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-7: 32px;
--space-8: 40px;
--space-9: 48px;
--space-10: 64px;
```

---

### Phase 2: Primitive Components

#### 2.1 Box Component
Base layout primitive - unstyled div wrapper.

```tsx
// src/components/ui/Box.tsx
interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ as: Component = 'div', className, ...props }, ref) => (
    <Component ref={ref} className={cn(className)} {...props} />
  )
);
```

#### 2.2 Flex Component
Flexbox layout helper.

```tsx
// src/components/ui/Flex.tsx
interface FlexProps extends BoxProps {
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  wrap?: boolean;
}
```

#### 2.3 Text Component
Typography primitive with variants.

```tsx
// src/components/ui/Text.tsx
interface TextProps {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'accent';
  as?: 'p' | 'span' | 'label';
}
```

---

### Phase 3: Compound Components

#### 3.1 Card with Composition
```tsx
// src/components/ui/Card/index.tsx
const Card = ({ children, glass, depth = 1 }) => { ... }

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// Usage:
<Card depth={2}>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>
```

#### 3.2 Tooltip Component
Already have inline, upgrade to proper component:

```tsx
// src/components/ui/Tooltip.tsx
interface TooltipProps {
  content: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  delayDuration?: number;
  children: React.ReactNode;
}
```

#### 3.3 Button Component
```tsx
// src/components/ui/Button.tsx
interface ButtonProps {
  variant?: 'default' | 'ghost' | 'outline' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}
```

---

### Phase 4: Custom Hooks

```tsx
// src/hooks/useKeyboardShortcut.ts
export function useKeyboardShortcut(
  keys: string[],
  callback: () => void,
  options?: { preventDefault?: boolean }
) { ... }

// src/hooks/useDebouncedValue.ts
export function useDebouncedValue<T>(value: T, delay: number): T { ... }

// src/hooks/useMediaQuery.ts
export function useMediaQuery(query: string): boolean { ... }
```

---

### Phase 5: File Structure

```
src/
├── components/
│   ├── ui/                    # Design system primitives
│   │   ├── Box.tsx
│   │   ├── Flex.tsx
│   │   ├── Text.tsx
│   │   ├── Button.tsx
│   │   ├── Card/
│   │   │   ├── Card.tsx
│   │   │   ├── Card.styles.ts
│   │   │   └── index.ts
│   │   ├── Tooltip.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   └── index.ts           # Barrel exports
│   │
│   ├── experiments/           # Experiment demos
│   ├── command-menu.tsx       # App-specific
│   ├── experiment-info.tsx
│   ├── gallery-card.tsx
│   └── ...
│
├── hooks/
│   ├── useKeyboardShortcut.ts
│   ├── useDebouncedValue.ts
│   ├── useMediaQuery.ts
│   └── index.ts
│
├── lib/
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── shadows.ts
│   │   └── index.ts
│   ├── cn.ts                  # clsx + tailwind-merge
│   └── experiments.ts
│
└── app/
    ├── globals.css            # CSS variables + base styles
    └── ...
```

---

### Phase 6: CSS Variables Update

Add to `globals.css`:

```css
:root {
  /* Existing colors... */

  /* Shadow system */
  --shadow-color: 0 0% 0%;
  --shadow-0: none;
  --shadow-1: 0.5px 1px 1px hsl(var(--shadow-color) / 0.33);
  --shadow-2: 1px 2px 2px hsl(var(--shadow-color) / 0.33),
              2px 4px 4px hsl(var(--shadow-color) / 0.33),
              4px 8px 8px hsl(var(--shadow-color) / 0.33);
  --shadow-3: 1px 2px 2px hsl(var(--shadow-color) / 0.2),
              2px 4px 4px hsl(var(--shadow-color) / 0.2),
              4px 8px 8px hsl(var(--shadow-color) / 0.2),
              8px 16px 16px hsl(var(--shadow-color) / 0.2),
              16px 32px 32px hsl(var(--shadow-color) / 0.2);

  /* Spacing scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-7: 2rem;
  --space-8: 2.5rem;
  --space-9: 3rem;
  --space-10: 4rem;

  /* Typography scale */
  --font-xs: 0.75rem;
  --font-sm: 0.875rem;
  --font-base: 1rem;
  --font-lg: 1.125rem;
  --font-xl: 1.25rem;
  --font-2xl: 1.5rem;
  --font-3xl: 1.875rem;
  --font-4xl: 2.25rem;

  /* Line heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* Z-index scale */
  --z-base: 0;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-overlay: 30;
  --z-modal: 40;
  --z-toast: 50;
}
```

---

## Implementation Priority

| Priority | Task | Effort |
|----------|------|--------|
| 1 | Add shadow & spacing tokens to CSS | Low |
| 2 | Create `cn()` utility | Low |
| 3 | Create Box, Flex, Text primitives | Medium |
| 4 | Create Tooltip component | Low |
| 5 | Create Button component | Medium |
| 6 | Create Card compound component | Medium |
| 7 | Extract hooks (keyboard, debounce) | Low |
| 8 | Refactor existing components to use primitives | High |

---

## Benefits

1. **Consistency**: All components use same tokens
2. **Maintainability**: Change token, update everywhere
3. **Developer Experience**: Autocomplete, type safety
4. **Composability**: Build complex UIs from primitives
5. **Scalability**: Easy to add new components
