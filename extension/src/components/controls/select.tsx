import { Component, For } from "solid-js";

const Input: Component<Prop> = (props) => {
  return (
    <div class="flex items-center justify-between gap-4 w-full z-20 my-4">
      <label for="input" class="block mb-2 label">
        {props.label}
      </label>
      <select
        onChange={(e) => {
          props.onInput(e.currentTarget.value);
        }}
        id="input"
        class="surface-base rounded-lg focus:border-blue-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent block max-w-80 p-2.5 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        required={props.required}
        value={props.value ?? ""}
      >
        <For each={props.options}>
          {(item) => <option value={item.value}>{item.name}</option>}
        </For>
      </select>
    </div>
  );
};

export default Input;

interface Prop {
  onInput: (e: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  options: Option[];
}

interface Option {
  value: any;
  name: string;
}
