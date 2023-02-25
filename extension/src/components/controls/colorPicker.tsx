import { Component, createEffect, onMount } from "solid-js";
import Picker from 'vanilla-picker';

const ColorPicker: Component<Props> = (props) => {
  let parent: HTMLDivElement;
  let bgPicker: Picker;
  onMount(() => {
    bgPicker = new Picker({
      parent,
      color: props.value,
      popup: props.side || "left"
    });
  });
  createEffect(() => {
    bgPicker.setColor(props.value, false);
    bgPicker.onChange = (color) => {
      props.onchange(color.hex);
    }
  });
  return <div class="flex justify-between items-center">
    <span class="block label">{props.label}</span>
    <div class="h-6 w-12 rounded-lg border-2 cursor-pointer" style={{ background: props.value }} ref={parent!}></div>
  </div>;
};

interface Props {
  label: string;
  value: string;
  onchange: (color: string) => void;
  side?: "left" | "right" | "top" | "bottom";
}

export default ColorPicker;