import { Component } from 'solid-js';

const Backdrop: Component<Prop> = (props) => {
  return (
    <div
      style={{
        'backdrop-filter': `blur(${props.blur}) saturate(${props.saturate}) brightness(${props.brightness})`,
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
