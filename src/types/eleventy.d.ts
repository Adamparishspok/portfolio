declare module '@11ty/eleventy' {
  export interface UserConfig {
    addGlobalData(key: string, value: any): void;
    setServerOptions(options: Record<string, any>): void;
    addPlugin(plugin: any, options?: Record<string, any>): void;
    addPassthroughCopy(path: string | Record<string, string>): void;
    addTransform(name: string, callback: (this: any, content: string) => string): void;
    addCollection(name: string, callback: (collection: any) => any[]): void;
    getFilter(name: string): any;
  }

  export class IdAttributePlugin {}
}

declare module '@11ty/eleventy-plugin-webc' {
  const pluginWebc: any;
  export default pluginWebc;
}

declare module '@11ty/eleventy-plugin-syntaxhighlight' {
  const syntaxHighlight: any;
  export default syntaxHighlight;
}

declare module '@11ty/eleventy-img' {
  export const eleventyImageTransformPlugin: any;
}

declare module 'html-minifier-terser' {
  export function minify(content: string, options: Record<string, any>): string;
}
