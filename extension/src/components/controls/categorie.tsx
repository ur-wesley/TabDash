import { Component, children, Show } from "solid-js";

const Categorie: Component<Prop> = (props) => {
  const c = children(() => props.children);
  return (
    <div class="color-base p-1 flex flex-col gap-1">
      <div
        class={`pl-4 tracking-widest text-md font-normal color-gray-600 dark:color-slate-400 flex justify-between ${
          !!!props.helpLink ? "pb-2" : ""
        }`}
      >
        <span>{props.name}</span>
        <Show when={!!props.helpLink}>
          <a href={props.helpLink} class="rounded-full p-2 bg-light-900">
            <div class="i-mdi-question-mark bg-black"></div>
          </a>
        </Show>
      </div>
      <div class="bg-base rounded-xl p-2">{c()}</div>
    </div>
  );
};

export default Categorie;

interface Prop {
  name: string;
  helpLink?: string;
  children?: any;
}
