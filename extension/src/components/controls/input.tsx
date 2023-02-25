import { Component, createSignal, Show } from "solid-js";

const Input: Component<Prop> = (props) => {
  const [error, setError] = createSignal(false);
  return (
    <div class="flex items-center justify-between gap-4 z-20 my-3 box-border">
      <Show when={props.label}>
        <label for="input" class="block label">
          {props.label}
        </label>
      </Show>
      <div class={`flex ${error() ? "flex-col" : ""}`}>
        <input
          class={`p-2 surface-base outline-0 ring-2 transition ring-transparent rounded-lg focus:border-blue-500 
          hover:bg-slate-100 dark:hover:bg-slate-800 border-0 block
          dark:placeholder-gray-400 dark:text-white border ${
            error()
              ? "focus:ring-red-500 dark:focus:ring-red-500"
              : "focus:ring-blue-500 dark:focus:ring-blue-500"
          }`}
          onInput={(e) => {
            if (!!props.validator) {
              if (!props.validator(e.currentTarget.value)) {
                setError(true);
                console.info("invalid");
                return;
              }
            }
            setError(false);
            props.onInput(e.currentTarget.value);
          }}
          type="text"
          id="input"
          required={props.required}
          value={props.value ?? ""}
          placeholder={props.placeholder}
          autocomplete="off"
          spellcheck={false}
        />
        <Show when={error()}>
          <span class="text-sm text-red">{props.error ?? "invalid value"}</span>
        </Show>
      </div>
    </div>
  );
};

export default Input;

interface Prop {
  onInput: (e: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  validator?: (v: string) => boolean;
  error?: string;
}
