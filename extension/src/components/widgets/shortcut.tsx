import { Component, createEffect, createSignal, Show } from "solid-js";
import {
  ShortcutAppereance,
  ShortcutSetting,
} from "../../../types/settings.js";
import { AvailableLanguages, messages } from "../../lang.js";
import TextButton from "../controls/button.jsx";
import Input from "../controls/input.jsx";
import Toggle from "../controls/toggle.jsx";

const Shortcut: Component<Prop> = (props) => {
  const size = (): number => {
    switch (props.style.style) {
      case "large":
        return 100;
      case "medium":
        return 75;
      case "small":
        return 50;
      default:
        return 25;
    }
  };
  const textSize = (): string => {
    switch (props.style.style) {
      case "large":
        return "text-lg";
      case "medium":
        return "text-md";
      case "small":
        return "text-sm";
      default:
        return "text-lg";
    }
  };
  const shortcutWidth = () => {
    if (props.style.style === "text")
      return "auto";
    return `${props.style.iconOnly ? size() : size() * 1.2}px`;
  };
  const shortcutHeight = () => {
    if (props.style.style === "text")
      return "50px";
    return `${props.style.iconOnly ? size() : size() * 1.5}px`;
  };
  const shortcutPadding = () => {
    if (props.style.style === "text")
      return "16px 8px";
    return "0";

  };
  const [showMenu, setShowMenu] = createSignal(false);
  const [pos, setPos] = createSignal({ x: 0, y: 0 });
  let shortcut: HTMLDivElement;
  createEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shortcut && !shortcut.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });
  const locale = props.locale;
  return (
    <>
      <div
        style={{
          flex: `0 0 ${props.col}%`,
          width: shortcutWidth(),
          height: shortcutHeight(),
          "grid-auto-flow": "column",
          display: "flex",
          "justify-content": "center",
          "align-items": "center"
        }}
      >
        <a
          class={`widget grow overflow-hidden flex flex-col items-center decoration-none transition hover:scale-105`}
          style={{
            padding: shortcutPadding(),
          }}
          href={props.settings.link}
          target={props.settings.newTab ? "_blank" : "_self"}
          onContextMenu={(e) => {
            e.preventDefault();
            let x = 0;
            let y = 0;
            if (window.innerHeight - 300 < e.clientY) y = -280;
            if (window.innerWidth - 300 < e.clientX) x = -270;
            setPos({ x: e.clientX + x, y: e.clientY + y });
            setShowMenu(true);
          }}
        >
          <Show when={size() > 25}>
            <img
              src={props.settings.icon}
              width={size()}
              height={size()}
              alt={`${props.settings.name} icon`}
            />
          </Show>
          <Show when={!props.style.iconOnly || props.style.style === "text"}>
            <div class="h-full grid content-center">
              <span class={`px-2 ${textSize()}`}>
                {props.settings.name}
              </span>
            </div>
          </Show>
        </a>
      </div>
      <Show when={showMenu()}>
        <div
          ref={shortcut!}
          class={`absolute z-30 p-4 bg-base-glass`}
          style={{
            top: pos().y + "px",
            left: pos().x + "px",
          }}
        >
          <Input
            label={messages["shortcut name"][locale]}
            value={props.settings.name}
            onInput={(s) => {
              props.settings = {
                ...props.settings,
                name: s,
              };
            }}
          />
          <Input
            label={messages["shortcut link"][locale]}
            value={props.settings.link}
            onInput={(s) => {
              props.settings = {
                ...props.settings,
                link: s,
              };
            }}
          />
          <Input
            label={messages["shortcut icon"][locale]}
            value={props.settings.icon}
            onInput={(s) => {
              props.settings = {
                ...props.settings,
                icon: s,
              };
            }}
          />
          <Toggle
            label={messages["new tab"][locale]}
            checked={props.settings.newTab}
            onChange={(s) => {
              props.settings = {
                ...props.settings,
                newTab: s,
              };
            }}
          />
          <div class="flex justify-between">
            <TextButton
              background={true}
              type="error"
              onClick={() => {
                props.onRemove(props.settings);
              }}
            >
              {messages.delete[locale]}
            </TextButton>
            <TextButton
              background={true}
              type="success"
              onClick={() => {
                props.onEdit(props.settings);
                setShowMenu(false);
              }}
            >
              {messages.save[locale]}
            </TextButton>
          </div>
        </div>
      </Show>
    </>
  );
};

export default Shortcut;

interface Prop {
  settings: ShortcutSetting;
  style: ShortcutAppereance;
  col: Number;
  locale: AvailableLanguages;
  onEdit: (shortcut: ShortcutSetting) => void;
  onRemove: (shortcut: ShortcutSetting) => void;
}
