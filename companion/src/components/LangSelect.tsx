import { AvailableLanguages, availableLanguages } from '../lang.js';
import { Component, For } from 'solid-js';
import { language } from '../helper/store.js';
import { useStore } from '@nanostores/solid';

const LangSelect: Component = () => {
  const $lang = useStore(language);
  return (
    <div>
      <select
        class='p-2 rounded-lg cursor-pointer border-2 border-transparent hover:border-blue-400 transition'
        oninput={(e) => {
          language.set(e.currentTarget.value as AvailableLanguages);
          const el = window.location.pathname.split('/');
          if (el[1] == 'docs') {
            const index = el.length == 2 ? 1 : 2;
            if (el[index] != $lang()) {
              el[index] = $lang();
              window.location.href = el.join('/');
            }
          }
        }}
      >
        <For each={availableLanguages}>
          {(lang) => (
            <option
              class='cursor-pointer'
              selected={lang == $lang()}
              value={lang}
            >
              {lang}
            </option>
          )}
        </For>
      </select>
    </div>
  );
};

export default LangSelect;
