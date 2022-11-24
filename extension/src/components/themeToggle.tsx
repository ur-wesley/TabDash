import { Component, createEffect, createSignal } from "solid-js";

const ThemeToggle: Component<Prop> = (props) => {
  const [theme, setTheme] = createSignal(props.theme);
  createEffect(() => {
    setTheme(props.theme);
    const mode = props.theme == "light" ? "dark" : "light";
    document.getElementsByTagName("html")[0].classList.remove(mode);
    document.getElementsByTagName("html")[0].classList.add(props.theme);
  });
  const updateTheme = () => {
    const mode = theme() == "light" ? "dark" : "light";
    document.getElementsByTagName("html")[0].classList.remove(mode);
    theme() === "light" ? setTheme("dark") : setTheme("light");
    document.getElementsByTagName("html")[0].classList.add(theme());
    props.update(theme());
  };
  return (
    <div
      class={`absolute right-2 top-2 cursor-pointer z-20 hover:bg-orange-600/80 p-2 rounded-full widget p-4 transition
          ${
            theme() == "light"
              ? " i-mdi-white-balance-sunny"
              : " i-mdi-weather-night"
          }`}
      onClick={updateTheme}
    ></div>
  );
};

export default ThemeToggle;

interface Prop {
  theme: "light" | "dark";
  update: (theme: "light" | "dark") => void;
}
