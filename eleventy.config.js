// @ts-check
import pluginWebc from '@11ty/eleventy-plugin-webc';
import htmlmin from 'html-minifier-terser';
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';
import { IdAttributePlugin } from '@11ty/eleventy';
import { eleventyImageTransformPlugin } from '@11ty/eleventy-img';

/**
 * @param {import('@11ty/eleventy').UserConfig} eleventyConfig
 */
export default function (eleventyConfig) {
  // Add environment detection
  eleventyConfig.addGlobalData('env', process.env.NODE_ENV || 'development');
  eleventyConfig.setServerOptions({ watch: ['_site/**/*.css'] });
  eleventyConfig.addPlugin(pluginWebc, { components: 'src/_components/**/*.webc' });
  eleventyConfig.addPassthroughCopy({
    'node_modules/gsap/dist/gsap.min.js': 'assets/js/gsap.min.js',
    'node_modules/gsap/dist/ScrollTrigger.min.js': 'assets/js/ScrollTrigger.min.js',
    'node_modules/gsap/dist/ScrollToPlugin.min.js': 'assets/js/ScrollToPlugin.min.js',
    'node_modules/gsap/dist/TextPlugin.min.js': 'assets/js/TextPlugin.min.js',
    'node_modules/gsap/dist/Draggable.min.js': 'assets/js/Draggable.min.js',
    'node_modules/gsap/dist/InertiaPlugin.min.js': 'assets/js/InertiaPlugin.min.js',
    'node_modules/axe-core/axe.min.js': 'assets/js/axe-core.js',
    'node_modules/posthog-js/dist/array.js': 'assets/js/posthog.min.js',
  });
  eleventyConfig.addPassthroughCopy({ 'src/assets/js': 'assets/js' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/images': 'assets/images' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/fonts': 'assets/fonts' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/email': 'assets/email' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/css/markdown.css': 'assets/css/markdown.css' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/css/cms.css': 'assets/css/cms.css' });
  eleventyConfig.addPassthroughCopy({
    'src/favicon.svg': 'favicon.svg',
    'src/favicon-96x96.png': 'favicon-96x96.png',
    'src/favicon.ico': 'favicon.ico',
    'src/apple-touch-icon.png': 'apple-touch-icon.png',
    'src/web-app-manifest-192x192.png': 'web-app-manifest-192x192.png',
    'src/web-app-manifest-512x512.png': 'web-app-manifest-512x512.png',
    'src/site.webmanifest': 'site.webmanifest',
  });
  eleventyConfig.addPassthroughCopy('src/robots.txt');
  eleventyConfig.addPassthroughCopy('src/_redirects');
  eleventyConfig.addPassthroughCopy('src/_headers');
  eleventyConfig.addPassthroughCopy({ 'src/admin': 'admin' });

  // Minify HTML output
  eleventyConfig.addTransform('htmlmin', function (content) {
    if ((this.page.outputPath || '').endsWith('.html')) {
      const minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
      });
      return minified;
    }
    return content;
  });

  // Syntax Highlighting
  eleventyConfig.addPlugin(syntaxHighlight);

  // Anchor links on heading tags
  eleventyConfig.addPlugin(IdAttributePlugin, {
    selector: 'h1,h2,h3',
    decodeEntities: true,
    slugify: eleventyConfig.getFilter('slugify'),
  });

  // Image optimization
  eleventyConfig.addPlugin(eleventyImageTransformPlugin);

  eleventyConfig.addCollection('pages', (collection) => {
    const pages = collection.getFilteredByGlob([
      './src/**/*.webc',
      './src/**/*.md',
      '!./src/docs/**',
      '!./src/test/**',
      '!./src/404.webc',
      '!./src/sitemap.webc',
    ]);
    return pages.reverse();
  });

  // Add legal collection
  eleventyConfig.addCollection('legal', (collection) => {
    const posts = collection.getFilteredByGlob('./src/legal/*.md');
    return posts.reverse();
  });

  // Add author collection
  eleventyConfig.addCollection('authors', (collection) => {
    const posts = collection.getFilteredByGlob('./src/authors/*.md');
    return posts.reverse();
  });

  // Add careers collection
  eleventyConfig.addCollection('careers', (collection) => {
    const posts = collection.getFilteredByGlob('./src/careers/*.md');
    return posts.reverse();
  });

  // Add insights collection
  eleventyConfig.addCollection('insights', (collection) => {
    const posts = collection.getFilteredByGlob('./src/insights/*.md');
    return posts.reverse();
  });

  // Get prev/next post in insights
  eleventyConfig.addCollection('insightsWithNav', (collection) => {
    const posts = collection.getFilteredByGlob('./src/insights/*.md').sort((/** @type {any} */ a, /** @type {any} */ b) => {
      return new Date(a.data.date).getTime() - new Date(b.data.date).getTime();
    });
    return posts.map((/** @type {any} */ post, /** @type {number} */ index) => {
      post.data.prev = index > 0 ? posts[index - 1] : null;
      post.data.next = index < posts.length - 1 ? posts[index + 1] : null;
      return post;
    });
  });

  // Add events collection
  eleventyConfig.addCollection('events', (collection) => {
    const posts = collection.getFilteredByGlob('./src/events/*.md');
    return posts.reverse();
  });

  return {
    htmlTemplateEngine: 'webc',
    dir: {
      input: 'src',
      output: '_site',
      includes: '_components',
      layouts: '_layouts',
      data: '_data',
    },
  };
}
