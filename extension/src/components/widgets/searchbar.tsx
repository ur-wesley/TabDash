import { Component, onMount } from "solid-js";
import { AvailableLanguages, messages } from "../../lang.js";
import { SearchSetting } from "../../../types/settings.js";
import Search from "../../api/search.js";

const Searchbar: Component<Props> = (props) => {
  let input: any;
  onMount(() => {
    if (props.settings.focus) input.focus();
  });
  return (
    <div class="text-lg flex items-center overflow-hidden widget">
      <input
        type="text"
        ref={input}
        placeholder={messages.search[props.lang]}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            Search.query(input.value, props.settings);
            input.value = "";
          }
        }}
        class="focus:outline-0 border-none fco p-3 h-full w-full text-lg bg-transparent"
        autocomplete="off"
        spellcheck={false}
      />
      <span class="bg-gray-600/50 dark:bg-gray-300/50 hover:bg-light-800 dark:hover:bg-dark-800 h-full p-1 cursor-pointer grid place-content-center">
        <span
          class="i-mdi-search p-3 text-md"
          onClick={() => {
            Search.query(input.value, props.settings);
            input.value = "";
          }}
        />
      </span>
    </div>
  );
};

export default Searchbar;

interface Props {
  lang: AvailableLanguages;
  settings: SearchSetting;
}
