import pluginWebc from '@11ty/eleventy-plugin-webc';
import htmlmin from 'html-minifier-terser';
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';
import { IdAttributePlugin } from '@11ty/eleventy';
import { eleventyImageTransformPlugin } from '@11ty/eleventy-img';

export default function (eleventyConfig) {
  eleventyConfig.setServerOptions({ watch: ['dist/**/*.css'] });
  eleventyConfig.addPlugin(pluginWebc, { components: 'src/_components/**/*.webc' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/js': 'assets/js' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/images': 'assets/images' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/fonts': 'assets/fonts' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/email': 'assets/email' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/css/markdown.css': 'assets/css/markdown.css' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/css/cms.css': 'assets/css/cms.css' });
  eleventyConfig.addPassthroughCopy('src/manifest.webmanifest');
  eleventyConfig.addPassthroughCopy('src/_redirects');
  eleventyConfig.addPassthroughCopy({ 'src/admin': 'admin' });

  // Minify HTML output
  eleventyConfig.addTransform('htmlmin', function (content) {
    if ((this.page.outputPath || '').endsWith('.html')) {
      let minified = htmlmin.minify(content, {
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
    const posts = collection.getFilteredByGlob('./src/insights/*.md').sort((a, b) => {
      return new Date(a.data.date) - new Date(b.data.date);
    });
    return posts.map((post, index) => {
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
      output: 'dist',
      includes: '_components',
      layouts: '_layouts',
      data: '_data',
    },
  };
}
