import { Component } from "solid-js";
import { AvailableLanguages, messages } from "../../lang.js";
const Greeting: Component<Prop> = (props) => {
  return (
    <span class="my-3 p-4 text-4xl text-bold color-base z-20">
      {messages.greeting[props.locale]} {props.name}
    </span>
  );
};

export default Greeting;

interface Prop {
  name: string;
  locale: AvailableLanguages;
}
