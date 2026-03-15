declare module 'splitting' {
  interface SplittingResult {
    el: HTMLElement;
    words?: HTMLElement[];
    chars?: HTMLElement[];
  }
  interface SplittingOptions {
    target?: HTMLElement | string;
    by?: 'words' | 'chars' | 'lines' | 'items' | 'rows' | 'cols' | 'grid' | 'cells' | 'cellRows' | 'cellColumns';
    key?: string;
  }
  function Splitting(options?: SplittingOptions): SplittingResult[];
  export default Splitting;
}

declare module 'splitting/dist/splitting.css' {
  const content: string;
  export default content;
}

declare module 'splitting/dist/splitting-cells.css' {
  const content: string;
  export default content;
}
