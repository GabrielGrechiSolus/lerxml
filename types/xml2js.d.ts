declare module 'xml2js' {
  interface ParserOptions {
    explicitArray?: boolean;
  }
  class Parser {
    constructor(options?: ParserOptions);
    parseStringPromise(xml: string): Promise<any>;
  }
  const xml2js: { Parser: typeof Parser };
  export = xml2js;
}
