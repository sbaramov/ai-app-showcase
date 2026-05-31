# Component Styling

Angular components can define styles that apply specifically to their template, enabling encapsulation and modularity.

## Defining Styles

Styles can be defined inline or in separate files.

```ts
@Component({
  selector: 'app-photo',
  // Inline styles
  styles: `
    img {
      border-radius: 50%;
    }
  `,
  // OR external file
  styleUrl: 'photo.component.css',
})
export class Photo {}
```

## View Encapsulation

Every component has a view encapsulation setting that determines how styles are scoped.

| Mode                            | Behavior                                                                                      |
| :------------------------------ | :-------------------------------------------------------------------------------------------- |
| `Emulated` (Default)            | Scopes styles to the component using unique HTML attributes. Global styles can still leak in. |
| `ShadowDom`                     | Uses the browser's native Shadow DOM API to isolate styles completely.                        |
| `None`                          | Disables encapsulation. Component styles become global.                                       |
| `ExperimentalIsolatedShadowDom` | Strictly guarantees that only the component's styles apply.                                   |

### Usage

```ts
import { ViewEncapsulation } from '@angular/core';

@Component({
  ...,
  encapsulation: ViewEncapsulation.None,
})
export class GlobalStyled {}
```

## Special Selectors

### `:host`

Targets the component's host element (the element matching the component's selector).

```css
:host {
  display: block;
  border: 1px solid black;
}
```

### `:host-context()`

Targets the host element based on some condition in its ancestry.

```css
/* Apply styles if any ancestor has the 'theme-dark' class */
:host-context(.theme-dark) {
  background-color: #333;
}
```

### `::ng-deep`

Disables view encapsulation for a specific rule, allowing it to "leak" into child components.
**Note: The Angular team strongly discourages the use of `::ng-deep`.** It is supported only for backwards compatibility.

## Styles in Templates

You can use `<style>` elements directly in a component's template. View encapsulation rules still apply.

```html
<style>
  .dynamic-class {
    color: red;
  }
</style>
<div class="dynamic-class">Hello</div>
```

## External Styles

Using `<link>` or `@import` in CSS is treated as external styles. **External styles are not affected by emulated view encapsulation.**

## Styling Third-Party & JIT-Generated Components

When customizing elements inside third-party component libraries (like Angular Material's `<mat-list-item>`), standard scoped component selectors often fail under default `Emulated` View Encapsulation.

### The Cause
The Angular compiler appends unique scoping attributes (like `_ngcontent-c123`) strictly to elements physically declared in your component HTML template. It does **not** append scoping attributes to children nodes generated at runtime by imported directives or libraries (like `.mdc-list-item__content` or `.mdc-list-item__end`).

### The Clean Solution (Bypassing `::ng-deep`)
Instead of using the deprecated and discouraged `::ng-deep` shadow-piercing combinator, target **template-defined sibling/child elements** that you physically declared in your template, and apply offsets (`margin-left`, `margin-right`, etc.) directly to them:

```html
<!-- HTML Template -->
<mat-list-item [class.pinned]="session.pinned">
  <!-- Template-defined element (gets scoped _ngcontent) -->
  <span matListItemTitle class="session-name-wrapper">
    <span class="session-name">{{ session.name }}</span>
  </span>
  <span matListItemLine class="session-meta">
    {{ session.entryCount }} entries
  </span>
</mat-list-item>
```

```css
/* CSS Stylesheet */
/* Target elements that are in our template directly to honor view encapsulation */
.session-item.pinned .session-name-wrapper,
.session-item.pinned .session-meta {
  margin-left: 32px !important; /* Shifts text cleanly and preserves scoping! */
}
```
