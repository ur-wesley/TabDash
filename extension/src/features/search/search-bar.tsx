import { type Component, onMount } from 'solid-js';
import type { SearchSetting } from '../../../types/settings';
import { searchQuery } from '../../api/search';
import { useI18n } from '../../i18n';

export interface SearchBarProps {
  settings?: SearchSetting;
}

export const SearchBar: Component<SearchBarProps> = (props) => {
  const { t } = useI18n();
  let inputRef: HTMLInputElement | undefined;

  onMount(() => {
    if (props.settings?.focus) {
      inputRef?.focus();
    }
  });

  const handleSearch = () => {
    const val = inputRef?.value?.trim();
    if (val && props.settings) {
      searchQuery(val, props.settings);
      if (inputRef) inputRef.value = '';
    }
  };

  return (
    <form
      class="text-lg flex items-center overflow-hidden widget w-full max-w-xl mx-auto shadow-md"
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
    >
      <input
        ref={(el) => {
          inputRef = el;
        }}
        type="search"
        placeholder={t('search')}
        class="focus:outline-none border-none p-3 h-full w-full bg-transparent placeholder:opacity-60"
        style={{
          color: 'var(--textColor)',
          'font-family': 'var(--font), sans-serif',
          'font-weight': 'var(--weight)',
          'font-size': 'var(--textSize)',
        }}
        autocomplete="off"
        spellcheck={false}
      />
      <button
        type="submit"
        aria-label={t('search')}
        class="bg-zinc-700/40 hover:bg-zinc-600/60 active:bg-zinc-500/80 h-full px-4 py-3 cursor-pointer flex items-center justify-center transition-colors border-none outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        style={{ color: 'var(--textColor)' }}
      >
        <span class="i-mdi-magnify text-xl" aria-hidden="true" />
      </button>
    </form>
  );
};
