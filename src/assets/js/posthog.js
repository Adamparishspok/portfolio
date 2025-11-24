import posthog from 'posthog-js'

posthog.init('phc_PVCwdgCGgAV76xJR6eA2DxTEwiqejQpFaUyz4oo8ltz', {
  api_host: 'https://us.i.posthog.com',
  person_profiles: 'identified_only' // or 'always' to create profiles for anonymous users as well
})

// Optional: Send a manual event for testing
posthog.capture('website_loaded', {
  page_url: window.location.href,
  timestamp: new Date().toISOString()
})
