import { Component } from "solid-js";

const Backdrop: Component<Prop> = (props) => {
  // const blur = `backdrop-blur-[${props.blur}px]`;
  // const saturate = `backdrop-saturate-[${props.saturate}]`;
  // const brightness = `backdrop-brightness-[${props.brightness}]`;
  return (
    <div
      style={{
        "backdrop-filter": `blur(${props.blur}) saturate(${props.saturate}) brightness(${props.brightness})`,
      }}
      class={`absolute z-10 left-0 top-0 w-full h-full backdrop-filter`}
    />
  );
};

export default Backdrop;

interface Prop {
  blur: string;
  brightness: string;
  saturate: string;
}
