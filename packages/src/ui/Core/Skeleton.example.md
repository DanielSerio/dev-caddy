# Skeleton Component Usage Examples

## Basic Usage

### Text Placeholder
```tsx
import { Skeleton } from 'dev-caddy';

// Single line of text
<Skeleton variant="text" width="200px" />

// Paragraph placeholder (multiple lines)
<div>
  <Skeleton variant="text" width="100%" />
  <Skeleton variant="text" width="100%" />
  <Skeleton variant="text" width="60%" />
</div>
```

### Avatar/Circular Placeholder
```tsx
// Circular avatar (40x40px by default)
<Skeleton variant="circular" />

// Custom size circular
<Skeleton variant="circular" width={64} height={64} />

// Using with number (converted to px)
<Skeleton variant="circular" width={80} />
```

### Rectangular Placeholder
```tsx
// Default rectangle
<Skeleton variant="rectangular" />

// Card placeholder
<Skeleton
  variant="rectangular"
  width="300px"
  height="200px"
  radius="12px"
/>

// Full width banner
<Skeleton width="100%" height="150px" radius="8px" />
```

## Advanced Usage

### Custom Styling
```tsx
<Skeleton
  width={200}
  height={100}
  radius={16}
  style={{
    margin: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }}
/>
```

### With Custom Class
```tsx
<Skeleton
  variant="text"
  className="my-custom-skeleton"
/>
```

### Annotation List Loading State
```tsx
function AnnotationList({ loading, annotations }) {
  if (loading) {
    return (
      <div className="annotation-list-skeleton">
        {[1, 2, 3].map(i => (
          <div key={i} style={{ marginBottom: '16px' }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="text" width="80%" style={{ marginLeft: '10px' }} />
            <Skeleton variant="rectangular" width="100%" height="60px" radius="8px" />
          </div>
        ))}
      </div>
    );
  }

  return annotations.map(annotation => (
    <AnnotationItem key={annotation.id} annotation={annotation} />
  ));
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'text' \| 'circular' \| 'rectangular'` | `'rectangular'` | Predefined skeleton style |
| `width` | `string \| number` | Variant-specific | Width (number = px, string = any CSS unit) |
| `height` | `string \| number` | Variant-specific | Height (number = px, string = any CSS unit) |
| `radius` | `string \| number` | Variant-specific | Border radius (number = px, string = any CSS unit) |
| `className` | `string` | `''` | Additional CSS class |
| `style` | `CSSProperties` | `{}` | Inline styles |

## Variant Defaults

### `variant="text"`
- Width: `100%`
- Height: `1em`
- Radius: `4px`

### `variant="circular"`
- Width: `40px`
- Height: `40px` (or matches width)
- Radius: `50%`

### `variant="rectangular"`
- Width: `100%`
- Height: `100px`
- Radius: `4px`

## CSS Variables

You can customize the skeleton appearance with CSS variables:

```css
:root {
  --dc-skeleton-bg: #e0e0e0;
  --dc-skeleton-shimmer: rgba(255, 255, 255, 0.5);
}
```

## Accessibility

The Skeleton component includes proper ARIA attributes:
- `aria-busy="true"` - Indicates content is loading
- `aria-label="Loading..."` - Screen reader announcement
