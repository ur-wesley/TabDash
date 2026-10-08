/**
 * Local declarations for `@nanostores/solid`: the published package points
 * its `types` field at a `dist/index.d.ts` that is missing from the bundle,
 * so the untyped import is declared here instead (no runtime change).
 */
declare module '@nanostores/solid' {
  export interface ReadableStore<T> {
    get(): T;
    listen(listener: (value: T) => void): () => void;
    subscribe(listener: (value: T) => void): () => void;
  }

  export function useStore<T>(store: ReadableStore<T>): import('solid-js').Accessor<T>;
}
