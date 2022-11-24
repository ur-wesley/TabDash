import { AvailableLanguages, availableLanguages } from '../lang.js';
import { Component, For } from 'solid-js';
import { language } from '../helper/store.js';
import { useStore } from '@nanostores/solid';

const LangSelect: Component = () => {
  const $language = useStore(language);
  return (
    <div>
      <select
        oninput={(e) => {
          language.set(e.currentTarget.value as AvailableLanguages);
          const el = window.location.pathname.split('/');
          const index = el.length == 2 ? 1 : 2;
          console.log(el.length, index);
          if (el[index] != $language()) {
            el[index] = $language();
            window.location.href = el.join('/');
          }
        }}
      >
        <For each={availableLanguages}>
          {(lang) => (
            <option selected={lang == $language()} value={lang}>
              {lang}
            </option>
          )}
        </For>
      </select>
    </div>
  );
};

export default LangSelect;
