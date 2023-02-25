import { Component, createSignal, Show } from "solid-js";
import {
  Setting,
  ShortcutSetting,
  ShortcutStyle,
  theme,
  Theme,
} from "../../types/settings.js";
import { getDefault, settingStore } from "../api/settingStore.js";
import { locale, setLocale } from "../App.jsx";
import {
  messages,
  helpLinks,
  AvailableLanguages,
  availableLanguages,
  searchEngine,
} from "../lang.js";
import TextButton from "./controls/button.jsx";
import Categorie from "./controls/categorie.jsx";
import Input from "./controls/input.jsx";
import Select from "./controls/select.jsx";
import Slider from "./controls/slider.jsx";
import Toggle from "./controls/toggle.jsx";
import Footer from "./settings/footer.jsx";
import Management from "./settings/management.jsx";
import Widget from "./settings/widgetSetting.jsx";

const SettingContent: Component<Prop> = (props) => {
  const [newShortcut, setNewShortcut] = createSignal<ShortcutSetting>({
    name: "",
    link: "",
    icon: "",
    newTab: false,
  });
  return (
    <div class="p-2 flex flex-col gap-4">
      <Categorie
        name={messages.general[locale()]}
        helpLink={helpLinks.base + locale() + helpLinks.general}
      >
        <Input
          label={messages.name[locale()]}
          placeholder={props.settings.general.username}
          value={props.settings.general.username}
          onInput={(e: string) => {
            settingStore.setKey("general", {
              ...props.settings.general,
              username: e,
            });
          }}
        />
        <Select
          label={messages.locale[locale()]}
          placeholder={props.settings.general.locale}
          value={props.settings.general.locale}
          onInput={(e: string) => {
            setLocale(e as AvailableLanguages);
            settingStore.setKey("general", {
              ...props.settings.general,
              locale: e as AvailableLanguages,
            });
            props.onWeatherUpdate();
          }}
          options={availableLanguages.map((l) => ({ value: l, name: l }))}
        />
        <Select
          label={messages.theme[locale()]}
          value={props.settings.general.theme}
          onInput={(e: string) => {
            settingStore.setKey("general", {
              ...props.settings.general,
              theme: e as Theme,
            });
          }}
          options={theme.map((t: Theme) => ({
            value: t,
            name: messages[t][locale()],
          }))}
        />
        <Input
          label={messages.title[locale()]}
          placeholder={props.settings.general.title}
          value={props.settings.general.title}
          onInput={(e: string) => {
            settingStore.setKey("general", {
              ...props.settings.general,
              title: e,
            });
          }}
        />
        <Input
          label={messages.favicon[locale()]}
          placeholder={props.settings.general.favicon}
          value={props.settings.general.favicon}
          onInput={(e: string) => {
            settingStore.setKey("general", {
              ...props.settings.general,
              favicon: e,
            });
          }}
        />
        <Show when={import.meta.env.VITE_IS_EXTENSION}>
          <Toggle
            label={messages["browser sync"][locale()]}
            onChange={(e) => {
              settingStore.setKey("general", {
                ...props.settings.general,
                sync: e,
              });
            }}
            checked={props.settings.layout.showClock}
          />
        </Show>
      </Categorie>
      <Categorie
        name={messages.layout[locale()]}
        helpLink={helpLinks.base + locale() + helpLinks.layout}
      >
        <Toggle
          label={messages["show clock"][locale()]}
          onChange={(e) => {
            settingStore.setKey("layout", {
              ...props.settings.layout,
              showClock: e,
            });
          }}
          checked={props.settings.layout.showClock}
        />
        <Toggle
          label={messages["show date"][locale()]}
          onChange={(e) => {
            settingStore.setKey("layout", {
              ...props.settings.layout,
              showDate: e,
            });
          }}
          checked={props.settings.layout.showDate}
        />
        <Toggle
          label={messages["show greeting"][locale()]}
          onChange={(e) => {
            settingStore.setKey("layout", {
              ...props.settings.layout,
              showGreeting: e,
            });
          }}
          checked={props.settings.layout.showGreeting}
        />
        <Toggle
          label={messages["show searchbar"][locale()]}
          onChange={(e) => {
            settingStore.setKey("layout", {
              ...props.settings.layout,
              showSearchbar: e,
            });
          }}
          checked={props.settings.layout.showSearchbar}
        />
        <Toggle
          label={messages["show weather"][locale()]}
          onChange={(e) => {
            settingStore.setKey("layout", {
              ...props.settings.layout,
              showWeather: e,
            });
          }}
          checked={props.settings.layout.showWeather}
        />
        <Toggle
          label={messages["show shortcuts"][locale()]}
          onChange={(e) => {
            settingStore.setKey("layout", {
              ...props.settings.layout,
              showShortcuts: e,
            });
          }}
          checked={props.settings.layout.showShortcuts}
        />
      </Categorie>
      <Categorie
        name={messages.background[locale()]}
        helpLink={helpLinks.base + locale() + helpLinks.background}
      >
        <Toggle
          label={messages["bg active"][locale()]}
          onChange={(e) => {
            settingStore.setKey("background", {
              ...props.settings.background,
              active: e,
            });
          }}
          checked={props.settings.background.active}
        />
        <Show when={props.settings.background.active}>
          <Input
            label={messages.collections[locale()]}
            placeholder={props.settings.background.collections.join(", ")}
            value={props.settings.background.collections.join(", ")}
            onInput={(e: string) => {
              settingStore.setKey("background", {
                ...props.settings.background,
                collections: e.split(",").map((i) => i.trim()),
              });
            }}
          />
        </Show>
        <Show when={!props.settings.background.active}>
          <Input
            label={messages["static img"][locale()]}
            placeholder={props.settings.background.static}
            value={props.settings.background.static}
            onInput={(e: string) => {
              settingStore.setKey("background", {
                ...props.settings.background,
                static: e,
              });
            }}
          />
          <Input
            label={messages.color[locale()]}
            placeholder={props.settings.background.color}
            value={props.settings.background.color}
            onInput={(e: string) => {
              settingStore.setKey("background", {
                ...props.settings.background,
                color: e,
              });
            }}
          />
        </Show>
        <Toggle
          label={messages.backdrop[locale()]}
          onChange={(e) => {
            settingStore.setKey("background", {
              ...props.settings.background,
              backdropActive: e,
            });
          }}
          checked={props.settings.background.backdropActive}
        />
        <Show when={props.settings.background.backdropActive}>
          <Slider
            label={messages.blur[locale()]}
            min={0}
            max={20}
            value={Number(
              props.settings.background.backdrop.blur.split("px")[0]
            )}
            onChange={(e: string) => {
              settingStore.setKey("background", {
                ...props.settings.background,
                backdrop: {
                  ...props.settings.background.backdrop,
                  blur: e + "px",
                },
              });
            }}
          />
          <Slider
            label={messages.brightness[locale()]}
            min={0}
            max={200}
            value={Number(
              props.settings.background.backdrop.brightness.split("%")[0]
            )}
            onChange={(e: string) => {
              settingStore.setKey("background", {
                ...props.settings.background,
                backdrop: {
                  ...props.settings.background.backdrop,
                  brightness: e + "%",
                },
              });
            }}
          />
          <Slider
            label={messages.saturate[locale()]}
            min={0}
            max={200}
            value={Number(
              props.settings.background.backdrop.saturate.split("%")[0]
            )}
            onChange={(e: string) => {
              settingStore.setKey("background", {
                ...props.settings.background,
                backdrop: {
                  ...props.settings.background.backdrop,
                  saturate: e + "%",
                },
              });
            }}
          />
        </Show>
        <Show when={props.settings.background.active}>
          <TextButton
            onClick={async () => {
              props.onRefreshImage();
            }}
          >
            {messages["reload img"][locale()]}
          </TextButton>
        </Show>
      </Categorie>
      <Categorie
        name={messages["shortcut settings"][locale()]}
        helpLink={helpLinks.base + locale() + helpLinks.shortcut}
      >
        <Toggle
          label={messages["shortcut icon only"][locale()]}
          checked={props.settings.shortcutAppereance.iconOnly}
          onChange={(e) => {
            settingStore.setKey("shortcutAppereance", {
              ...props.settings.shortcutAppereance,
              iconOnly: e,
            });
          }}
        />
        <Select
          label={messages["shortcut size"][locale()]}
          value={props.settings.shortcutAppereance.style}
          onInput={(e) => {
            settingStore.setKey("shortcutAppereance", {
              ...props.settings.shortcutAppereance,
              style: e as ShortcutStyle,
            });
          }}
          options={[
            { value: "large", name: messages.large[locale()] },
            { value: "medium", name: messages.medium[locale()] },
            { value: "small", name: messages.small[locale()] },
            { value: "text", name: messages.text[locale()] },
          ]}
        />
        <Slider
          label={messages["shortcuts per line"][locale()]}
          min={1}
          max={10}
          step={1}
          value={props.settings.shortcutAppereance.elementsPerLine}
          onChange={(e) => {
            settingStore.setKey("shortcutAppereance", {
              ...props.settings.shortcutAppereance,
              elementsPerLine: Number(e),
            });
          }}
          showValue={true}
        />
      </Categorie>
      <Categorie
        name={messages["new shortcut"][locale()]}
        helpLink={helpLinks.base + locale() + helpLinks.shortcut}
      >
        <Input
          label={messages["shortcut name"][locale()]}
          value={newShortcut().name}
          onInput={(e: string) => {
            newShortcut().name = e;
          }}
        />
        <Input
          label={messages["shortcut link"][locale()]}
          value={newShortcut().link}
          onInput={(e: string) => {
            newShortcut().link = e;
          }}
        />
        <Input
          label={messages["shortcut icon"][locale()]}
          value={newShortcut().icon}
          onInput={(e: string) => {
            newShortcut().icon = e;
          }}
        />
        <Toggle
          label={messages["new tab"][locale()]}
          onChange={(e) => {
            newShortcut().newTab = e;
          }}
        />
        <TextButton
          background={true}
          onClick={() => {
            if (
              Object.entries(newShortcut()).some(
                ([k, v]) =>
                  k != "newTab" && k != "icon" && (v == "" || v == undefined)
              )
            )
              return;
            if (!newShortcut().link.startsWith("http"))
              newShortcut().link = `https://${newShortcut().link}`;
            if (newShortcut().icon == "")
              newShortcut().icon = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${newShortcut().link
                }&size=128`;
            props.addShortcut(newShortcut());
            setNewShortcut({
              name: "",
              link: "",
              icon: "",
              newTab: false,
            });
          }}
        >
          {messages.add[locale()]}
        </TextButton>
      </Categorie>
      <Categorie
        name={messages["time and date"][locale()]}
        helpLink={helpLinks.base + locale() + helpLinks.time}
      >
        <Toggle
          label={messages["show seconds"][locale()]}
          onChange={(e) => {
            settingStore.setKey("clock", {
              ...props.settings.clock,
              showSeconds: e,
            });
          }}
          checked={props.settings.clock.showSeconds}
        />
      </Categorie>
      <Categorie
        name={messages["search settings"][locale()]}
        helpLink={helpLinks.base + locale() + helpLinks.search}
      >
        <Toggle
          label={messages["focus search"][locale()]}
          checked={props.settings.search.focus}
          onChange={(e) => {
            settingStore.setKey("search", {
              ...props.settings.search,
              focus: e,
            });
          }}
        />
        <Toggle
          label={messages["new tab"][locale()]}
          checked={props.settings.search.newTab}
          onChange={(e) => {
            settingStore.setKey("search", {
              ...props.settings.search,
              newTab: e,
            });
          }}
        />
        <Select
          label={messages["search engine"][locale()]}
          value={props.settings.search.engine}
          placeholder={props.settings.search.engine}
          options={searchEngine.map((s) => ({ name: s.name, value: s.name }))}
          onInput={(e) => {
            settingStore.setKey("search", {
              ...props.settings.search,
              engine: e,
            });
          }}
        />
      </Categorie>
      <Categorie
        name={messages.weather[locale()]}
        helpLink={helpLinks.base + locale() + helpLinks.weather}
      >
        <Toggle
          label={messages["show weather icon"][locale()]}
          checked={props.settings.weather.showIcon}
          onChange={(e) => {
            settingStore.setKey("weather", {
              ...props.settings.weather,
              showIcon: e,
            });
          }}
        />
        <Toggle
          label={messages["show weather text"][locale()]}
          checked={props.settings.weather.showText}
          onChange={(e) => {
            settingStore.setKey("weather", {
              ...props.settings.weather,
              showText: e,
            });
          }}
        />
        <Toggle
          label={messages["imperial"][locale()]}
          onChange={(e) => {
            settingStore.setKey("weather", {
              ...props.settings.weather,
              unit: e ? "imperial" : "metric",
            });
            props.onWeatherUpdate();
          }}
          checked={props.settings.weather.unit == "imperial"}
        />
      </Categorie>
      <Widget
        settings={props.settings.widgetSetting}
      />
      <Management
        settings={props.settings}
        reset={async () => settingStore.set(await getDefault())}
      />
      <Footer />
    </div>
  );
};

export default SettingContent;

interface Prop {
  settings: Setting;
  addShortcut: (shortcut: ShortcutSetting) => void;
  onRefreshImage: () => void;
  onWeatherUpdate: () => void;
}
