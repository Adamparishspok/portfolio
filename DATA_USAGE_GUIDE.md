# Data Files Usage Guide - Eleventy + WebC

This guide explains how to use data files (`src/_data/`) in your Eleventy + WebC portfolio.

## How Data Files Work

Files in `src/_data/` become **globally available** throughout your site:

- `base.js` → available as `base`
- `navigation.json` → available as `navigation`

**IMPORTANT:** WebC components (`_components/*.webc`) do NOT automatically have access to global data. You must pass data as props.

## WebC Syntax for Using Data

**Important Context Rules:**

### 1. **Data Access in Pages vs Components**

- **In page files** (like `index.webc`, `main.webc`): Use `this.` prefix → `this.base.name`
- **In component files** (like `_components/site-header.webc`): **NO** `this.` prefix → `base.name`

### 2. **Passing Data to Components** ⚠️ **CRITICAL**

Components do NOT automatically have access to global data. You must explicitly pass it:

```html
<!-- In your layout/page file (main.webc) -->
<site-header :base="base" :navigation="navigation"></site-header>
```

Without passing data, the component will have `undefined` for all data variables.

### 1. **Text Content** - Use `@text`

```html
<!-- In PAGE files (index.webc) -->
<span @text="this.base.name"></span>
<!-- Output: Adam Parish -->

<!-- In COMPONENT files (_components/*.webc) -->
<span @text="base.name"></span>
<!-- Output: Adam Parish -->

<span @text="base.currentYear()"></span>
<!-- Output: 2025 -->
```

### 2. **Attributes** - Use `:attribute`

```html
<!-- Dynamic href -->
<a :href="this.base.linkedinLink">LinkedIn</a>

<!-- Dynamic aria-label -->
<button :aria-label="this.base.name">Click me</button>

<!-- Template literals for complex values -->
<a :href="`mailto:${this.base.email}`">Email</a>
```

### 3. **Conditional Attributes**

```html
<!-- Only add rel if target is _blank -->
<a
  :href="item.href"
  :target="item.target"
  :rel="item.target === '_blank' ? 'noopener noreferrer' : ''"
  >Link</a
>
```

### 4. **Loops** - Use `webc:for`

```html
<!-- Loop through navigation items -->
<a webc:for="item of this.navigation" :href="item.href" @text="item.label"></a>
```

### 5. **JavaScript Expressions**

```html
<!-- Call functions and methods -->
<span @text="this.base.name.toUpperCase()"></span>
<!-- Output: ADAM PARISH -->

<!-- Conditionals -->
<div webc:if="this.base.env === 'production'">Production only</div>
```

## Current Implementation Examples

### ✅ Using the Site Header Component

**Step 1: Pass data to component** (in `main.webc` layout)

```html
<site-header :base="base" :navigation="navigation"></site-header>
```

**Step 2: Component receives props** (`_components/site-header.webc`)
**Note:** Component files use direct data access (no `this.` prefix) because they receive data as props

```html
<!-- Dynamic name with scramble effect -->
<a href="/" class="text-scramble">
  <span @text="base.name"></span>
</a>

<!-- Dynamic navigation from navigation.json -->
<nav>
  <a
    webc:for="item of navigation"
    :href="item.href"
    :target="item.target"
    :rel="item.target === '_blank' ? 'noopener noreferrer' : ''"
  >
    <span @text="item.label"></span>
  </a>
</nav>

<!-- Dynamic email -->
<a :href="\`mailto:\${base.email}\`">
  <span @text="base.email"></span>
</a>
```

### ✅ Footer (`index.webc`)

```html
<!-- Dynamic email with linked LinkedIn -->
<p>
  Drop me a line at
  <a :href="\`mailto:\${this.base.email}\`" @text="this.base.email"></a>, or reach out on
  <a :href="this.base.linkedinLink" target="_blank">LinkedIn</a>.
</p>

<!-- Dynamic copyright year -->
<div>
  © <span @text="this.base.currentYear()"></span>
  <span @text="this.base.name.toUpperCase()"></span>
</div>
```

## Available Data

### `base` (from `base.js`)

- `base.url` - Site URL
- `base.domain` - Production domain
- `base.name` - Your name
- `base.email` - Contact email
- `base.env` - Environment (development/production)
- `base.twitterHandle` - Twitter handle
- `base.twitterLink` - Twitter URL
- `base.githubLink` - GitHub URL
- `base.linkedinLink` - LinkedIn URL
- `base.instagramLink` - Instagram URL
- `base.dribbbleLink` - Dribbble URL
- `base.currentYear()` - Function that returns current year

### `navigation` (from `navigation.json`)

Array of navigation items:

```json
[
  {
    "label": "Home",
    "href": "/",
    "target": "_self"
  },
  {
    "label": "LinkedIn",
    "href": "https://www.linkedin.com/in/atomizer/",
    "target": "_blank"
  }
]
```

### `experience` (from `experience.js`)

Array of job/experience items:

```javascript
[
  {
    company: 'Atomic Financial',
    title: 'Lead Product Designer',
    period: 'Mar 2022 - Present',
    isCurrent: true,
  },
  {
    company: 'Aon',
    title: 'Lead Product Designer',
    period: 'Nov 2019 - Mar 2022',
    isCurrent: false,
  },
  // ... more roles
];
```

## More Examples

### Experience/Jobs List with Conditional Rendering

```html
<div class="divide-y divide-white/5">
  <div webc:for="role of this.experience" class="p-6 transition-colors hover:bg-white/2">
    <!-- Show indicator only for current role -->
    <div webc:if="role.isCurrent" class="mb-1 flex items-center justify-between">
      <h4 class="text-scramble" @text="role.company"></h4>
      <div class="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
    </div>

    <!-- Show regular heading for past roles -->
    <h4 webc:else class="text-scramble mb-1" @text="role.company"></h4>

    <p @text="role.title"></p>
    <p @text="role.period"></p>
  </div>
</div>
```

### Social Links Component

```html
<div class="social-links">
  <a :href="this.base.twitterLink" target="_blank" rel="noopener noreferrer">
    <span webc:if="this.base.twitterHandle" @text="this.base.twitterHandle"></span>
  </a>
  <a :href="this.base.githubLink" target="_blank" rel="noopener noreferrer"> GitHub </a>
  <a :href="this.base.dribbbleLink" target="_blank" rel="noopener noreferrer"> Dribbble </a>
</div>
```

### Conditional Content Based on Environment

```html
<!-- Show only in development -->
<div webc:if="this.base.env === 'development'" class="debug-info">
  <p>Development Mode</p>
</div>

<!-- Show only in production -->
<div webc:if="this.base.env === 'production'">
  <!-- Analytics, etc -->
</div>
```

### Dynamic Meta Tags (already in `main.webc`)

```html
<meta property="og:site_name" :content="base.name" />
<meta property="og:url" :content="base.url + page.url" />
<meta name="twitter:site" :content="base.twitterHandle" />
```

## Adding New Data

### Option 1: Add to Existing Files

```javascript
// src/_data/base.js
export default {
  // ... existing data
  tagline: 'Lead Product Designer',
  location: 'Spokane, WA',
  coordinates: {
    lat: '47.6588° N',
    lon: '117.4260° W',
  },
};
```

### Option 2: Create New Data File

```javascript
// src/_data/projects.js
export default [
  {
    title: 'CloudEngage',
    description: 'Facebook-level personalization for websites.',
    tags: ['Product Lead', 'Design Systems'],
    link: '/mobile',
  },
  // ... more projects
];
```

Then use it:

```html
<div webc:for="project of this.projects">
  <h3 @text="project.title"></h3>
  <p @text="project.description"></p>
</div>
```

## Best Practices

1. **Keep data centralized** - Update once, use everywhere
2. **Use template literals** for complex strings: `:href="\`mailto:\${base.email}\`"`
3. **Add rel="noopener noreferrer"** for external links with `target="_blank"`
4. **Use functions** in data files for dynamic values (like `currentYear()`)
5. **Type-safe data** - Use `.js` files when you need functions or computed values
6. **Simple data** - Use `.json` files for static arrays/objects

## Benefits

- ✅ **Single source of truth** - Update in one place
- ✅ **Consistent** - Same data across all pages
- ✅ **Maintainable** - Easy to update links, contact info, etc.
- ✅ **Dynamic** - Automatically updates (like current year)
- ✅ **Type-safe** - Use JavaScript for validation/defaults

---

**Need help?** Check the [Eleventy docs](https://www.11ty.dev/docs/data/) and [WebC docs](https://www.11ty.dev/docs/languages/webc/)
