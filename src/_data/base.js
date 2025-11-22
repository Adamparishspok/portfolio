export default {
  url: process.env.URL || 'http://localhost:8080',
  domain: 'https:/atomparish.com',
  name: 'Atom Parish',
  env: process.env.ENVIRONMENT || 'development',

  twitterHandle: '@atomparish1',
  twitterLink: 'https://twitter.com/atomparish1',
  githubLink: 'https://github.com/atompariskspok',
  linkedinLink: 'https://www.linkedin.com/in/atomizer/',
  instagramLink: 'https://www.instagram.com/atomparish/',
  dribbbleLink: 'https://dribbble.com/atomparish/',

  // Current year
  currentYear() {
    const today = new Date();
    return today.getFullYear();
  },
};
