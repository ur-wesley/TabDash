import type { Component } from "solid-js";
import { messages } from "../lang.js";
import { language } from "../helper/store.js";
import { useStore } from "@nanostores/solid";
import { version } from "../../package.json";

import "./styles/footer.scss";

const Footer: Component = () => {
  const $lang = useStore(language);
  return (
    <footer class="w-full flex gap-4 flex-col md:flex-row justify-around items-center bg-dark-100/50 text-center py-6">
      <div>
        <a href="/privacy">
          <span>{messages["privacy"][$lang()]}</span>
        </a>
      </div>
      <div>
        <p> {messages["source"][$lang()]}:</p>
        <ul class="flex flex-col gap-2">
          <li>
            <a href={messages["documentation source"].link}>
              {messages["documentation source"][$lang()]}
            </a>
            <div class="text-blue-400 text-sm transform">{version}</div>
          </li>
        </ul>
      </div>
      <div>{messages["made in"][$lang()]}</div>
    </footer>
  );
};

export default Footer;
