import { Component, createSignal } from "solid-js";
import { messages } from "../../lang.js";
import { locale } from "../../App.jsx";
import { settingStore } from "../../api/settingStore.js";
import { WidgetSetting } from "../../../types/settings.js";
import Categorie from "../controls/categorie.jsx";
import Select from "../controls/select.jsx";
import Slider from "../controls/slider.jsx";
import Tabs from "../controls/tabs.jsx";
import Input from "../controls/input.jsx";
import ColorPicker from "../controls/colorPicker.jsx";

const Widget: Component<Props> = (props) => {
  const [selectedTheme, setSelectedTheme] = createSignal<"light" | "dark">("light");
  const weightOptions = [{
    value: "900",
    name: messages["big weight"][locale()],
  }, {
    value: "700",
    name: messages["medium weight"][locale()],
  }, {
    value: "400",
    name: messages["normal weight"][locale()],
  }, {
    value: "300",
    name: messages["thin weight"][locale()],
  }];
  return <Categorie name={messages["widget appereance"][locale()]}>
    <Tabs
      tabs={[messages.light[locale()], messages.dark[locale()]]}
      onchange={(tab) => setSelectedTheme(tab == 0 ? "light" : "dark")}
    >
      <section>
        <ColorPicker
          label={messages["text color"][locale()]}
          value={props.settings[selectedTheme()].textColor}
          side="left"
          onchange={(color) =>
            settingStore.setKey("widgetSetting", {
              ...props.settings,
              [selectedTheme()]: {
                ...props.settings[selectedTheme()],
                textColor: color
              }
            })}
        />
        <Slider
          label={messages["text size"][locale()]}
          min={6}
          max={32}
          value={Number(
            props.settings[selectedTheme()].textSize.split("px")[0]
          )}
          onChange={(e: string) => {
            settingStore.setKey("widgetSetting", {
              ...props.settings,
              [selectedTheme()]: {
                ...props.settings[selectedTheme()],
                textSize: e + "px"
              }
            });
          }}
        />
        <ColorPicker
          label={messages["background color"][locale()]}
          value={props.settings[selectedTheme()].background}
          side="left"
          onchange={(color) =>
            settingStore.setKey("widgetSetting", {
              ...props.settings,
              [selectedTheme()]: {
                ...props.settings[selectedTheme()],
                background: color
              }
            })}
        />
        <Slider
          label={messages["border radius"][locale()]}
          min={0}
          max={32}
          value={Number(

            props.settings[selectedTheme()].borderRadius.split("px")[0]
          )}
          onChange={(e: string) => {
            settingStore.setKey("widgetSetting", {
              ...props.settings,
              [selectedTheme()]: {
                ...props.settings[selectedTheme()],
                borderRadius: e + "px"
              }
            });
          }}
        />
        <Slider
          label={messages["text shadow"][locale()]}
          min={0}
          max={1}
          step={0.05}
          value={Number(
            props.settings[selectedTheme()].shadow.split(",")[3].split(')')[0]
          )}
          onChange={(e: string) => {
            settingStore.setKey("widgetSetting", {
              ...props.settings,
              [selectedTheme()]: {
                ...props.settings[selectedTheme()],
                shadow: `rgba(0,0,0,${e}) 1px 2px 6px`
              }
            });
          }}
        />
        <Input
          label={messages.font[locale()]}
          value={props.settings[selectedTheme()].font}
          onInput={(e: string) => {
            settingStore.setKey("widgetSetting", {
              ...props.settings,
              [selectedTheme()]: {
                ...props.settings[selectedTheme()],
                font: e
              }
            });
          }}
        />
        <Select
          label={messages["font weight"][locale()]}
          value={props.settings[selectedTheme()].weight}
          onInput={(e: string) => {
            settingStore.setKey("widgetSetting", {
              ...props.settings,
              [selectedTheme()]: {
                ...props.settings[selectedTheme()],
                weight: e
              }
            });
          }}
          options={weightOptions}
        />
        <Slider
          label={messages.blur[locale()]}
          min={0}
          max={20}
          step={1}
          showValue={true}
          value={Number(
            props.settings[selectedTheme()].backdrop.blur.split("px")[0]
          )}
          onChange={(e: string) => {
            settingStore.setKey("widgetSetting", {
              ...props.settings,
              [selectedTheme()]: {
                ...props.settings[selectedTheme()],
                backdrop: {
                  ...props.settings[selectedTheme()].backdrop,
                  blur: e + "px"
                }

              }
            });
          }}
        />
        <Slider
          label={messages.saturate[locale()]}
          min={0}
          max={200}
          step={5}
          showValue={true}
          value={Number(
            props.settings[selectedTheme()].backdrop.saturate.split("%")[0]
          )}
          onChange={(e: string) => {
            settingStore.setKey("widgetSetting", {
              ...props.settings,
              [selectedTheme()]: {
                ...props.settings[selectedTheme()],
                backdrop: {
                  ...props.settings[selectedTheme()].backdrop,
                  saturate: e + "%"
                }

              }
            });
          }}
        />
        <Slider
          label={messages.brightness[locale()]}
          min={0}
          max={200}
          step={5}
          showValue={true}
          value={Number(
            props.settings[selectedTheme()].backdrop.brightness.split("%")[0]
          )}
          onChange={(e: string) => {
            settingStore.setKey("widgetSetting", {
              ...props.settings,
              [selectedTheme()]: {
                ...props.settings[selectedTheme()],
                backdrop: {
                  ...props.settings[selectedTheme()].backdrop,
                  brightness: e + "%"
                }

              }
            });
          }}
        />
      </section>
    </Tabs>
  </Categorie >
};

export default Widget;

interface Props {
  settings: WidgetSetting;
}

// textColor: string,           x color picker  
// textSize: string,            x slider
// background: string,          x color picker
// borderRadius: string,        x slider
// shadow: string,              x slider
// font: string,                - select
// weight: string,              - select
// backdrop: BackdropSetting    x 3 slider: blur, saturate, brightness
