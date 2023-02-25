import { Component } from "solid-js";

const Sublabel: Component<Props> = (props) => {
  return (
    <div class="w-full color-fade border-b-2 pt-4 pb-2 tracking-wider color-base border-gray text-center">
      <span>{props.label}</span>
    </div>
  );
};

export default Sublabel;

interface Props {
  label: string;
}
