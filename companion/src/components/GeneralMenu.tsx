import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import LangSelect from "./LangSelect.jsx";
import Link from "./Link.jsx";
import { language } from "../helper/store.js";
import { useStore } from "@nanostores/solid";

const GeneralMenu: Component<Props> = (props) => {
  const $language = useStore(language);
  const [open, setOpen] = createSignal(false);
  const [stars, setStars] = createSignal(null);
  createEffect(async () => {
    const stars = await fetch("https://api.github.com/repos/ur-wesley/TabDash")
      .then((r) => r.json())
      .then((r) => r.stargazers_count || 0);
    setStars(stars);
  });
  onMount(() => {
    if (typeof window !== "undefined")
      window.addEventListener("resize", onresize);
  });
  onCleanup(() => {
    if (typeof window !== "undefined")
      window.removeEventListener("resize", onresize);
  });
  const onresize = () => setOpen(false);
  return (
    <header class="sticky top-0 w-full flex justify-between items-center bg-light-100/60 h-14 px-2 backdrop-filter backdrop-blur-sm z-20">
      <a href="/" class="flex h-full items-center">
        <img src="/favicon.svg" alt="tabdash icon" class="w-full h-full p-2" />
        <h3 class="text-4xl text-gray-600 px-2">TabDash</h3>
      </a>
      <ul
        class={`flex gap-4 flex-col md:flex-row justify-around md:justify-center
        w-full md:w-auto h-70 md:h-auto py-10 md:p-0 
        bg-blue-100/60 md:bg-transparent backdrop-blur-md md:backdrop-blur-0 
        transition top-0 left-0 absolute md:relative
        list-none items-center border-none ${open()
            ? "-translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 md:opacity-100 md:-translate-y-0"
          }`}
      >
        <li>
          <LangSelect />
        </li>
        <li>
          <Link href={`/docs/${$language()}`}>Docs</Link>
        </li>
        <li>
          <Link href={props.url + "/" + $language()}>Online Version</Link>
        </li>
        <li class="flex items-center gap-2">
          <Link href="https://github.com/ur-wesley/tabdash">GitHub</Link>
          <Show when={stars()}>
            <span>
              <svg
                height="16px"
                width="16px"
                version="1.1"
                id="Capa_1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 47.94 47.94"
                fill="#ED8A19"
                stroke="#ED8A19"
              >
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    style="fill:#ED8A19;"
                    d="M26.285,2.486l5.407,10.956c0.376,0.762,1.103,1.29,1.944,1.412l12.091,1.757 c2.118,0.308,2.963,2.91,1.431,4.403l-8.749,8.528c-0.608,0.593-0.886,1.448-0.742,2.285l2.065,12.042 c0.362,2.109-1.852,3.717-3.746,2.722l-10.814-5.685c-0.752-0.395-1.651-0.395-2.403,0l-10.814,5.685 c-1.894,0.996-4.108-0.613-3.746-2.722l2.065-12.042c0.144-0.837-0.134-1.692-0.742-2.285l-8.749-8.528 c-1.532-1.494-0.687-4.096,1.431-4.403l12.091-1.757c0.841-0.122,1.568-0.65,1.944-1.412l5.407-10.956 C22.602,0.567,25.338,0.567,26.285,2.486z"
                  ></path>
                </g>
              </svg>
            </span>
            <span>{stars()}</span>
          </Show>
        </li>
      </ul>
      <div
        class={`flex md:hidden absolute top-1 right-1 flex-col h-12 w-12 justify-center group cursor-pointer rounded-lg p-2 z-20 transition ${open() ? "bg-red" : "bg-transparent"
          }`}
        onclick={() => setOpen(!open())}
      >
        <div
          class={`w-8 h-0.5 transition my-1 ${open()
            ? "transform rotate-45 translate-y-2.5 bg-white"
            : "bg-gray-600"
            }`}
        ></div>
        <div
          class={`w-8 h-0.5 bg-gray-600 transition my-1 ${open() ? "opacity-0" : ""
            }`}
        ></div>
        <div
          class={`h-0.5 transition  my-1 ${open()
            ? "transform -rotate-45 -translate-y-2.5 w-8 bg-white"
            : "w-5 bg-gray-600"
            }`}
        ></div>
      </div>
    </header>
  );
};

interface Props {
  url: string;
}

export default GeneralMenu;
