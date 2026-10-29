import { useStore } from '@nanostores/solid';
import { For } from 'solid-js';
import type { Component } from 'solid-js';
import { language } from '../helper/store.js';
import { availableLanguages } from '../lang.js';
import type { AvailableLanguages } from '../lang.js';

const DOCS_LANG_INDEX = 1,
  DOCS_LANG_INDEX_WITH_PAGE = 2,
  DOCS_PATH_SEGMENT = 'docs',
  MIN_DOCS_PATH_PARTS = 2;

const LangSelect: Component = () => {
  const $lang = useStore(language);
  return (
    <div>
      <select
        class="p-2 rounded-lg cursor-pointer border-2 border-transparent hover:border-blue-400 transition"
        oninput={(event) => {
          language.set(event.currentTarget.value as AvailableLanguages);
          const pathParts = globalThis.location.pathname.split('/');
          if (pathParts[1] === DOCS_PATH_SEGMENT) {
            let langIndex = DOCS_LANG_INDEX_WITH_PAGE;
            if (pathParts.length === MIN_DOCS_PATH_PARTS) {
              langIndex = DOCS_LANG_INDEX;
            }
            if (pathParts[langIndex] !== $lang()) {
              pathParts[langIndex] = $lang();
              globalThis.location.href = pathParts.join('/');
            }
          }
        }}
      >
        <For each={availableLanguages}>
          {(lang) => (
            <option class="cursor-pointer" selected={lang === $lang()} value={lang}>
              {lang}
            </option>
          )}
        </For>
      </select>
    </div>
  );
};

export default LangSelect;
