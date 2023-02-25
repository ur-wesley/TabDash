import { Component, createSignal } from "solid-js";
import "./toggle.css";
const Toggle: Component<Prop> = (props) => {
  const [toggle, setToggle] = createSignal(props.checked ?? false);
  return (
    <div class="flex items-center justify-between w-full my-3">
      <div class="color-base label">{props.label}</div>
      <label class="flex items-center cursor-pointer">
        <div class="relative">
          <input
            type="checkbox"
            class="sr-only"
            onChange={(e: any) => {
              props.onChange(e.target.checked);
              setToggle(e.target.checked);
            }}
            checked={toggle()}
          />
          <div
            class={`block w-14 h-8 rounded-full transition ${
              toggle() ? "bg-blue-500" : "surface-base"
            }`}
          ></div>
          <div class="dot absolute left-1 top-1 bg-base w-6 h-6 rounded-full transition"></div>
        </div>
      </label>
    </div>
  );
};

export default Toggle;

interface Prop {
  onChange: (e: boolean) => void;
  label: string;
  checked?: boolean;
}
