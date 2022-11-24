import { Component, children } from "solid-js";

const TextButton: Component<Prop> = (props) => {
  const c = children(() => props.children);
  const style = (): string => {
    let style = "";
    if (props.background ?? false) {
      switch (props.type) {
        case "primary":
          style = "bg-blue-500 text-white hover:bg-blue-200 hover:text-black";
          break;
        case "error":
          style = "bg-red-500 text-white hover:bg-red-200 hover:text-black";
          break;
        case "success":
          style = "bg-green-500 text-white hover:bg-green-200 hover:text-black";
          break;
        default:
          style = "bg-blue-500 text-white hover:bg-blue-200 hover:text-black";
          break;
      }
    } else {
      switch (props.type) {
        case "primary":
          style =
            "bg-transparent text-blue-500 hover:bg-blue-200 hover:text-black";
          break;
        case "error":
          style =
            "bg-transparent text-red-500 hover:bg-red-200 hover:text-black";
          break;
        case "success":
          style =
            "bg-transparent text-green-500 hover:bg-green-200 hover:text-black";
          break;
        default:
          style =
            "bg-transparent text-blue-500 hover:bg-blue-200 hover:text-black";
          break;
      }
    }
    return style;
  };
  return (
    <button
      onclick={props.onClick}
      class={`px-4 py-2 rounded-xl border-none cursor-pointer transition font-medium tracking-wide text-md ${style()}`}
    >
      {c()}
    </button>
  );
};

export default TextButton;

interface Prop {
  children?: any;
  background?: boolean;
  type?: ButtonType;
  onClick?: () => void;
}

type ButtonType = "primary" | "error" | "success";
