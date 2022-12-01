import { Component, createSignal, Show } from 'solid-js';
import Search from '../../api/search.js';
import { AvailableLanguages, messages } from '../../lang.js';

const Searchbar: Component<Props> = (props) => {
  let input: any;
  return (
    <div class='text-lg flex items-center overflow-hidden widget'>
      <input
        type='text'
        ref={input}
        placeholder={messages.search[props.lang]}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            Search.query(input.value);
            input.value = '';
          }
        }}
        class='focus:outline-0 border-none fco p-3 h-full w-full text-lg bg-transparent color-base placeholder-gray-800 darK:placeholder-gray-200'
        autocomplete='off'
        spellcheck={false}
      />
      <span class='bg-dark-100/50 dark:bg-light-100/50 hover:bg-light-800 dark:hover:bg-dark-800 h-full p-1 cursor-pointer grid place-content-center'>
        <span
          class='i-mdi-search text-gray-300 p-3  text-md hover:text-gray-400'
          onClick={() => {
            Search.query(input.value);
            input.value = '';
          }}
        />
      </span>
    </div>
  );
};

export default Searchbar;

interface Props {
  lang: AvailableLanguages;
}
