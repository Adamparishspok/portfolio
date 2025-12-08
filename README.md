# Adam Parish - Portfolio

This is the personal portfolio website for Adam Parish, a Lead Product Designer based in Spokane, WA.

## Tech Stack

- **HTML5**: Semantic structure.
- **Tailwind CSS**: Styling
- **Lucide Icons**: Iconography.
- **Google Fonts**: Typography (Inter and Geist).
- **Unicorn Studio**: Background effects.
- [11ty](https://www.11ty.dev/)
- [WebC](https://www.11ty.dev/docs/languages/webc/)

## Deployment

This site is designed to be deployed on [Cloudflare Pages](https://pages.cloudflare.com/).

### Local Development

To run locally, you can simply open `index.html` in your browser, or use a simple HTTP server:

```bash
npx serve .
```

## Accessibility Testing

This project includes axe-core for automated accessibility testing.

### Automated Testing

Run accessibility tests using axe-core:

```bash
# Test the current development server
pnpm run test:axe

# Test a specific URL
node scripts/test-a11y.js https://example.com

# CI testing (builds and tests)
pnpm run test:axe:ci
```

### Manual Testing

In development mode, axe-core is automatically included in the site. You can run accessibility tests directly in the browser console:

```javascript
// Run all accessibility tests
axe.run().then((results) => {
  console.log('Violations:', results.violations.length);
  console.log(results);
});

// Run tests on a specific element
axe.run(document.getElementById('main-content')).then((results) => {
  console.log(results);
});
```

### Fixing Common Issues

The automated tests may find issues like:

- Missing button labels
- Insufficient color contrast
- Missing landmark regions
- Invalid ARIA attributes

Fix these issues by:

1. Adding proper `aria-label` attributes to interactive elements
2. Ensuring sufficient color contrast ratios
3. Using semantic HTML elements (`<main>`, `<nav>`, `<header>`, etc.)
4. Validating ARIA usage

## License

© 2026 Adam Parish. All rights reserved.
