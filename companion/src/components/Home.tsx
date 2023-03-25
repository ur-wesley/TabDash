import { useStore } from "@nanostores/solid";
import { Component, For, onCleanup, onMount } from "solid-js";
import { language } from "../helper/store.js";
import useQuery from "../helper/useQuery.js";
import {
  availableLanguages,
  AvailableLanguages,
  features,
  messages,
} from "../lang.js";
import Feature from "./Feature.jsx";
import Footer from "./Footer.jsx";

import "./styles/animations.scss";

const Home: Component = () => {
  const isChrome = navigator.userAgent.includes("Chrome");
  const $lang = useStore(language);
  onMount(async () => {
    const queryLang = useQuery(window.location.href).lang as AvailableLanguages;
    if (availableLanguages.includes(queryLang)) language.set(queryLang);
    const img = document.querySelector("#tabdash_example") as HTMLImageElement;
    img.addEventListener("mousemove", (e) => animateImage(e, img));

  });

  onCleanup(() => {
    const img = document.querySelector("#tabdash_example") as HTMLImageElement;
    window.removeEventListener("mousemove", (e) => animateImage(e, img));
  });
  const animateImage = (e: MouseEvent, element: HTMLElement) => {
    const width = window.screen.width / 2;
    const height = window.screen.height / 2;
    const centerX = e.clientX - width;
    const centerY = e.clientY - height;
    const degX = centerX * 0.005;
    const degY = centerY * 0.01;
    element.style.transform = `perspective(1000px) rotateX(${degX}deg) rotateY(${degY}deg)`;
  };
  return (
    <main class="h-screen overflow-y-auto overflow-x-hidden">
      <section class="flex flex-col justify-around items-center h-full">
        <div class="text-4xl md:text-6xl m-8 font-bold text-white/40 grid place-content-center">
          <span class="animate-[animateIn_500ms]">
            {messages.welcome[$lang()]}
          </span>
          <span class="animate-[animateIn_500ms_200ms]">
            <h1 class="text-5xl md:text-7xl text-animation">TabDash</h1>
          </span>
        </div>
        <div class="w-full p-2 grid place-content-center animate-[animateIn_500ms_300ms]">
          {!isChrome && (
            <div class="flex flex-col justify-center items-center gap-2">
              <span class="text-xl text-center">
                {messages["for firefox"][$lang()]}
              </span>
              <a href="https://addons.mozilla.org/de/firefox/addon/tabdash/">
                <img
                  src="https://img.shields.io/amo/v/tabdash?label=TabDash&style=for-the-badge&logo=Firefox-Browser"
                  alt="banner download for firefox"
                />
              </a>
            </div>
          )}
          {isChrome && (
            <div>
              <span class="text-xl text-center">
                {messages["for chrome"][$lang()]}
              </span>
            </div>
          )}
        </div>
        <div class="p-4 flex justify-center items-center lg:max-h-2/3">
          <img
            id="tabdash_example"
            src="/images/homescreen.png"
            alt="example screen"
            loading="lazy"
            height="100px"
            class="rounded-xl lg:max-h-4/5 lg:max-w-9/10 animate-[animateIn_500ms_400ms]"
          />
        </div>
      </section>
      <section class="flex flex-col justify-center items-between h-auto">
        <div class="sticky left-1/2 -translate-x-1/2 top-2 h-20 bg-gray/50 w-64 grid place-content-center tracking-widest font-bold text-xl z-10 backdrop-blur-sm rounded-xl">
          Features
        </div>
        <div class="w-full flex flex-col items-center">
          <For each={features}>
            {(feature, index) => (
              <Feature
                imgSide={index() % 2 == 0 ? "right" : "left"}
                feature={feature}
              />
            )}
          </For>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default Home;
