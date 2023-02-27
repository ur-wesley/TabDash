import {
  Component,
  createEffect,
  createSignal,
  onMount,
  onCleanup,
  Show,
} from "solid-js";
import { Setting, ShortcutSetting } from "../../types/settings.js";
import SettingContent from "./settingContent.jsx";

const SettingToggle: Component<Prop> = (props) => {
  let settingPanel: HTMLElement;
  const [showSetting, setShowSetting] = createSignal(false);
  onMount(() =>
    window.addEventListener(
      "resize",
      () => (settingPanel.style.height = "100%")
    )
  );
  onCleanup(() =>
    window.removeEventListener(
      "resize",
      () => (settingPanel.style.height = "100%")
    )
  );
  let startHeight = 0;
  let menuHeight = 0;
  let menuClicked = false;
  createEffect(() => {
    startHeight = settingPanel.clientHeight;
    const handleClickOutside = (event: MouseEvent) => {
      const t = event.target as Node;
      if (!settingPanel || t.nodeName == "SPAN") return;
      if (settingPanel && !settingPanel.contains(event.target as Node)) {
        animateWidgets(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });
  //#region menu move handler
  const dragstart = (e: TouchEvent | MouseEvent) => {
    e.preventDefault();
    menuClicked = true;
    settingPanel.classList.remove("h-full");
    document.addEventListener("pointermove", dragmove);
    document.addEventListener("pointerup", dragend);
  };
  const dragend = (e: TouchEvent | MouseEvent) => {
    e.preventDefault();
    menuClicked = false;
    document.removeEventListener("pointermove", dragmove);
    document.removeEventListener("pointerup", dragend);
    if (startHeight - menuHeight < 300) {
      setShowSetting(false);
      animateWidgets(false);
      setTimeout(() => {
        menuHeight = 0;
        settingPanel.style.height = `${startHeight}px`;
      }, 500)
    }
  };
  const dragmove = (e: MouseEvent) => {
    e.preventDefault();
    if (!menuClicked) return;
    menuHeight += e.movementY;
    if (startHeight - menuHeight >= startHeight)
      menuHeight = 0;
    settingPanel.style.height = `${startHeight - menuHeight}px`;

  };
  //#endregion

  const animateWidgets = (state: boolean = true) => {
    setShowSetting(state);
    const el = document.getElementById("content");
    if (showSetting()) {
      el!.classList.add(
        "-translate-y-15",
        "md:-translate-y-0",
        "md:-translate-x-15"
      );
      el!.style.transition = "all 300ms";
    } else
      el!.classList.remove(
        "-translate-y-15",
        "md:-translate-y-0",
        "md:-translate-x-15"
      );
  };

  return (
    <>
      <div
        class={`z-40 widget absolute right-2 bottom-2 grid place-content-center overflow-hidden p-1`}
      >
        <span
          class={`i-mdi-cog transition cursor-pointer p-3 transition ease-in-out duration-300 outline-transparent border-red ${showSetting() ? "rotate-45 text-gray-800 dark:text-gray-200" : "hover:rotate-12"
            }`}
          onClick={() => animateWidgets(!showSetting())}
        />
      </div>
      <Show when={showSetting()}>
        <div class="absolute top-0 left-0 w-screen h-screen backdrop-brightness-90"></div>
      </Show>
      <aside
        ref={settingPanel!}
        class={`absolute right-0 bottom-0 md:top-0 h-full w-full md:w-100 max-w-full md:max-w-1/2 surface-base transition z-30 overflow-y-auto ${!showSetting()
          ? "opacity-0 translate-y-full md:translate-y-0 md:translate-x-full"
          : "opacity-100"
          }`}
      >
        <Show when={showSetting()}>
          <div
            class="sticky top-0 md:hidden h-12 backdrop-blur-sm w-full z-40 bg-blue/60 dark:bg-blue/40 cursor-row-resize grid place-content-center"
            onpointerdown={dragstart}
          >
            <div class="i-mdi-arrow-split-horizontal bg-white dark:bg-black"></div>
          </div>
        </Show>
        <SettingContent
          settings={props.settings}
          addShortcut={props.addShortcut}
          onRefreshImage={props.onRefreshImage}
          onWeatherUpdate={props.onWeatherUpdate}
        />
      </aside>
    </>
  );
};

export default SettingToggle;

interface Prop {
  settings: Setting;
  addShortcut: (shortcut: ShortcutSetting) => void;
  onRefreshImage: () => void;
  onWeatherUpdate: () => void;
}
