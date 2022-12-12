import type { Component } from 'solid-js';
import { language } from '../helper/store.js';
import { useStore } from '@nanostores/solid';

const Link: Component<Props> = (props) => {
  const $language = useStore(language);
  return (
    <a
      class='tracking-wide text-2xl text-blue-400 hover:underline'
      href={props.href + $language()}
    >
      {props.children}
    </a>
  );
};

export default Link;

interface Props {
  href: string;
  children: any;
}
