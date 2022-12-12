import { Component, onCleanup, onMount } from 'solid-js';
import { AvailableLanguages, messages } from '../lang.js';

import './styles/animations.scss';

const Home: Component = () => {
  const isChrome = navigator.userAgent.includes('Chrome');
  const language =
    (location.href.split('/').at(-1) as AvailableLanguages) || 'en';
  onMount(() => {
    const img = document.querySelector('#tabdash_example') as HTMLImageElement;
    window.addEventListener('mousemove', (e) => animateImage(e, img));
  });
  onCleanup(() => {
    const img = document.querySelector('#tabdash_example') as HTMLImageElement;
    window.removeEventListener('mousemove', (e) => animateImage(e, img));
  });
  const animateImage = (e: MouseEvent, element: HTMLElement) => {
    const width = window.screen.width / 2;
    const height = window.screen.height / 2;
    const centerX = e.clientX - width;
    const centerY = e.clientY - height;
    const degX = centerX * 0.01;
    const degY = centerY * 0.01;
    element.style.transform = `perspective(1000px) scale(0.8) rotateX(${degX}deg) rotateY(${degY}deg)`;
  };
  return (
    <main class='flex flex-col h-full items-center gap-4 p-2 md:p-6 lg:p-12'>
      <span class='text-6xl p-8 font-bold text-white/40'>
        {messages.welcome[language]}{' '}
        <h1 class='text-7xl text-animation'>TabDash</h1>
      </span>
      <div class='h-full flex flex-col justify-around md:grid md:grid-rows-2 md:grid-cols-2 md:grid-rows-1 md:items-center relative'>
        <section class='w-full p-2 grid place-content-center'>
          {!isChrome && (
            <div class='flex flex-col justify-center items-center gap-2 md:gap-4'>
              <span class='text-xl text-center'>
                {messages['for firefox'][language]}
              </span>
              <a href='https://addons.mozilla.org/de/firefox/addon/tabdash/'>
                <img
                  src='https://img.shields.io/amo/v/tabdash?label=TabDash&style=for-the-badge&logo=Firefox-Browser'
                  alt='banner download for firefox'
                />
              </a>
            </div>
          )}
          {isChrome && (
            <div>
              <span class='text-xl text-center'>
                {messages['for chrome'][language]}
              </span>
            </div>
          )}
        </section>
        <section>
          <img
            id='tabdash_example'
            src='/homescreen.png'
            alt='example screen'
            loading='lazy'
            class='rounded-xl scale-80'
          />
        </section>
      </div>
    </main>
  );
};

export default Home;
