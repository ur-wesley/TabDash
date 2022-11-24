import type { Component } from 'solid-js';
import { language } from '../helper/store.js';
import { useStore } from '@nanostores/solid';
import './styles/LinkStyles.scss';
const Link: Component<Props> = (props) => {
  const $language = useStore(language);
  return (
    <a class='customLink' href={props.href + $language()}>
      {props.children}
    </a>
  );
};

export default Link;

interface Props {
  href: string;
  children: any;
}
