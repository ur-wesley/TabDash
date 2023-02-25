import { Component } from "solid-js";
import { AvailableLanguages, messages } from "../../lang.js";
const Greeting: Component<Prop> = (props) => {
  return (
    <div class="flex flex-col items-center widget">
      <span class="my-3 p-4 text-4xl text-bold">
        {messages.greeting[props.locale]} {props.name}
      </span>
    </div>
  );
};

export default Greeting;

interface Prop {
  name: string;
  locale: AvailableLanguages;
}
