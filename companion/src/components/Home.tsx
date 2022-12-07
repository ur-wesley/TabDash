import type { Component } from 'solid-js';
import { AvailableLanguages, messages } from '../lang.js';

const Home: Component = () => {
  const isChrome = navigator.userAgent.includes('Chrome');
  const language =
    (location.href.split('/').at(-1) as AvailableLanguages) || 'en';
  return (
    <section class='flex flex-col items-center'>
      <h1 class='text-4xl p-8'>{messages.welcome[language]}</h1>
      {!isChrome && (
        <div class='flex flex-col justify-center items-center gap-4'>
          <span class='text-center'>{messages['for firefox'][language]}</span>
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
          <span class='text-center'>{messages['for chrome'][language]}</span>
        </div>
      )}
    </section>
  );
};

export default Home;
