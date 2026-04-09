# Vibe View Selector

Frontend demo and reference implementation for a Vibe Coding page-element picker.

This repository contains two layers:

- `packages/react-vite-dev-element-pick`
  The reusable picker library. It provides DOM element hover/click inspection, structured `ElementInfo`, and customizable overlay / highlight renderers.
- `src/components/VibePicker`
  The demo integration used by the landing-page prototype. It shows the editing flow used by the Host product: enter edit mode, hover elements, lock selection on click, then open an edit prompt panel.

## Quick Start

```bash
npm install
npm run dev
npm run build
```

Default dev URL:

```txt
http://localhost:5173
```

## Host Integration

The picker library is source-linked inside this repo and is imported with the alias below:

```tsx
import { ElementPicker } from 'react-vite-dev-element-pick'
import type { ElementInfo, PickerStatus } from 'react-vite-dev-element-pick'
```

Minimal usage:

```tsx
import { useState } from 'react'
import { ElementPicker } from 'react-vite-dev-element-pick'
import type { ElementInfo } from 'react-vite-dev-element-pick'

export function HostPage() {
  const [status, setStatus] = useState<'active' | 'inactive'>('inactive')

  const handleClick = (info: ElementInfo) => {
    console.log('picked:', info.selector, info)
  }

  return (
    <ElementPicker status={status} onClick={handleClick}>
      <YourPage />
    </ElementPicker>
  )
}
```

Common props:

- `status`: enables or disables picking.
- `onHover(info)`: called when the hovered target changes.
- `onClick(info)`: called when the user clicks an element.
- `onChange(info | null)`: called when the current target becomes another element or clears.
- `resolveElement(el)`: optional target normalization hook before building `ElementInfo`.
- `exclude`: selectors that should never be pickable, for example your own overlay UI.
- `highlight(props)` / `overlay(props)`: render custom picker UI.

## Official Reference UI

These two components were extracted so Host engineers can inspect, copy, or reuse the exact visual layer used in the demo:

- `packages/react-vite-dev-element-pick/src/components/FloatTips.tsx`
- `packages/react-vite-dev-element-pick/src/components/PickerHighlight.tsx`

Public exports:

```tsx
import { FloatTips, PickerHighlight } from 'react-vite-dev-element-pick'
import type { FloatTipsProps, PickerHighlightProps } from 'react-vite-dev-element-pick'
```

What they cover:

- `FloatTips`
  White floating hover label with tag/class formatting, quoted text preview, ellipsis handling, and viewport-aware cursor-follow positioning.
- `PickerHighlight`
  Blue element highlight with 4px radius, 1px border, 8% fill, and Motion-based transition settings tuned for hover switching.

## Demo Flow

The main demo orchestration lives in `src/components/VibePicker/index.tsx`.

It adds product-specific behavior on top of the base picker:

- hover gap stabilization between sibling elements
- selection lock after click
- floating input panel after selection
- outside-click close when prompt content is empty
- scroll lock while the prompt is open

This demo code is intentionally separate from the shared package so Host teams can choose how much UX logic they want to adopt.

## ElementInfo Shape

Every hover / click callback receives a structured `ElementInfo` object that includes:

- `element`: raw DOM node
- `selector`: CSS selector string
- `attributes`: normalized HTML attributes
- `sourceLocation`: React Fiber debug source when available
- `rect`: bounding rectangle snapshot
- `margins`: computed CSS margins

Type definitions live in `packages/react-vite-dev-element-pick/src/types.ts`.

## Repository Structure

```txt
packages/react-vite-dev-element-pick/src/
  ElementPicker.tsx
  index.ts
  types.ts
  components/
    FloatTips.tsx
    PickerHighlight.tsx
  utils/

src/
  App.tsx
  components/
    Toolbar.tsx
    VibePicker/
```

## Notes

- The package is intended for React 18 + Vite 5 development environments.
- The demo host uses `resolveElement` to avoid selecting overly fine-grained inline nodes.
- The exported reference UI components are meant to be readable and copy-friendly for downstream integration work.
