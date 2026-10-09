import type { Component, JSX } from 'solid-js';

const Link: Component<Props> = (props) => (
  <a class="tracking-wide text-2xl text-blue-400 hover:underline" href={props.href}>
    {props.children}
  </a>
);

export default Link;

interface Props {
  href: string;
  children: JSX.Element;
}
