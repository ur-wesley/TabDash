import { Component, createSignal, onCleanup, onMount } from 'solid-js';
import LangSelect from './LangSelect.jsx';
import Link from './Link.jsx';

const GeneralMenu: Component<Props> = (props) => {
  const [open, setOpen] = createSignal(false);
  onMount(() => window.addEventListener('resize', onresize));
  onCleanup(() => window.removeEventListener('resize', onresize));
  const onresize = () => setOpen(false);
  return (
    <div class='sticky top-0 w-full flex justify-between items-center bg-light-100/70 h-14 px-2 backdrop-blur-md'>
      <a href='/' class='flex h-full items-center'>
        <img src='/favicon.svg' alt='tabdash icon' class='w-full h-full p-2' />
        <h3 class='text-4xl text-gray-600'>TabDash</h3>
      </a>
      <ul
        class={`${
          open()
            ? 'flex wrap justify-around gap-4 w-full h-32 bg-blue-100 top-0 left-0 pt-12 translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 md:opacity-100 md:translate-y-0'
        } transition absolute md:flex md:gap-2 list-none md:relative md:justify-center items-center p-0 border-none`}
      >
        <li>
          <LangSelect />
        </li>
        <li>
          <Link href='/docs/'>Docs</Link>
        </li>
        <li>
          <Link href={props.url}>Online Version</Link>
        </li>
        <li>
          <Link href='https://github.com/ur-wesley/tabdash'>GitHub</Link>
        </li>
      </ul>
      <div
        class='block md:hidden cursor-pointer p-2'
        onclick={() => setOpen(!open())}
      >
        <div class='flex flex-col gap-2'>
          <span
            class={`w-8 h-0.5 bg-gray-600 transition ${
              open() ? 'transform -rotate-45 translate-y-2' : ''
            }`}
          ></span>
          <span
            class={`w-8 h-0.5 bg-gray-600 transition ${
              open() ? 'opacity-0' : ''
            }`}
          ></span>
          <span
            class={`h-0.5 bg-gray-600 transition ${
              open() ? 'transform rotate-45 -translate-y-2 w-8' : 'w-5'
            }`}
          ></span>
        </div>
      </div>
    </div>
  );
};

interface Props {
  url: string;
}

export default GeneralMenu;
