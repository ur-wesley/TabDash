import { Component, Show } from "solid-js";
import { sendToast } from "../../../types/notification.js";
import { Setting } from "../../../types/settings.js";
import { settingStore, SettingObject } from "../../api/settingStore.js";

import { locale } from "../../App.jsx";
import { helpLinks, messages } from "../../lang.js";
import TextButton from "../controls/button.jsx";
import Categorie from "../controls/categorie.jsx";
import FileInput from "../controls/fileinput.jsx";
import Input from "../controls/input.jsx";
import Sublabel from "../controls/sublabel.jsx";
import Tabs from "../controls/tabs.jsx";
import Textarea from "../controls/textarea.jsx";

const Management: Component<Props> = (props) => {
  const getSettingObject = async (json: any): Promise<SettingObject> => {
    return await SettingObject.fromJson(json);
  };

  const importFromClipboard = async () => {
    try {
      const settings = await navigator.clipboard.readText();
      settingStore.set(await getSettingObject(JSON.parse(settings)));
      sendToast(
        messages["import success clipboard"][locale()],
        "success",
        5000
      );
    } catch {
      sendToast(messages["import fail"][locale()], "error", 5000);
    }
  };

  const exportToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(
          { ...props.settings, cache: { images: [] } },
          undefined,
          2
        )
      );
      sendToast(
        messages["export success clipboard"][locale()],
        "success",
        5000
      );
    } catch {
      sendToast(messages["export fail"][locale()], "error", 5000);
    }
  };

  const importFromCloud = async () => {
    try {
      const pw = prompt(messages["select export password"][locale()]);
      if (!pw) return;
      const key = props.settings.id;
      const res = await fetch(
        `${import.meta.env.VITE_COMPANION_BASE}/api/setting/${key}?p=${pw}`
      ).then((r) => r.json());
      if (res) settingStore.set(await getSettingObject(res));
      sendToast(messages["import success cloud"][locale()], "success", 5000);
    } catch {
      sendToast(messages["import fail"][locale()], "error", 5000);
    }
  };

  const importFromInput = async (value: string) => {
    try {
      const data = JSON.parse(value);
      settingStore.set(await getSettingObject(data));
      sendToast(
        messages["import success clipboard"][locale()],
        "success",
        5000
      );
    } catch (error) {
      sendToast(messages["import fail"][locale()], "error", 5000);
    }
  };

  const exportToCloud = async () => {
    try {
      const pw = prompt(messages["import password"][locale()]);
      if (!pw) return;
      const key =
        props.settings.id == "0" ? crypto.randomUUID() : props.settings.id;
      settingStore.setKey("id", key);
      await fetch(
        `${import.meta.env.VITE_COMPANION_BASE}/api/setting/${key}?p=${pw}`,
        {
          method: "POST",
          body: JSON.stringify({ ...props.settings, cache: { images: [] } }),
        }
      );
      sendToast(messages["export success cloud"][locale()], "success", 5000);
    } catch {
      sendToast(messages["export fail"][locale()], "error", 5000);
    }
  };

  const exportToFile = async () => {
    const data =
      "text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify(
          { ...props.settings, cache: { images: [] } },
          undefined,
          2
        )
      );
    const a = document.createElement("a");
    a.href = "data:" + data;
    a.download = `TabDash-${new Date().toLocaleDateString(locale())}.json`;
    a.click();
    a.remove();
  };

  const resetAll = () => {
    const doReset = confirm(messages["confirm reset"][locale()]);
    if (!doReset) return;
    props.reset();
  };

  return (
    <Categorie
      name={messages.management[locale()]}
      helpLink={helpLinks.base + locale() + helpLinks.management}
    >
      <Tabs tabs={[messages.import[locale()], messages.export[locale()]]}>
        <div>
          <Sublabel label={messages.local[locale()]} />
          <FileInput
            label={messages["drop file"][locale()]}
            oninput={(v) => {
              importFromInput(v);
            }}
          />
          <Input
            label={messages["manually setting input"][locale()]}
            validator={(v) => {
              if (!v) return true;
              try {
                JSON.parse(v);
                return true;
              } catch {
                return false;
              }
            }}
            error={messages["no json format"][locale()]}
            onInput={importFromInput}
          />
          <Show when={false}>
            <TextButton onClick={importFromClipboard}>
              {messages["import local"][locale()]}
            </TextButton>
          </Show>
          <Sublabel label={messages.online[locale()]} />
          <div class="flex flex-col w-full gap-2">
            <Input
              label={messages["setting id"][locale()]}
              value={props.settings.id}
              onInput={(e: string) => {
                settingStore.setKey("id", e);
              }}
              validator={(e: string) => {
                const validId =
                  /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
                return new RegExp(validId).test(e);
              }}
              error={messages["incorrect id"][locale()]}
            />
            <TextButton onClick={importFromCloud}>
              {messages["import cloud"][locale()]}
            </TextButton>
          </div>
        </div>
        <div>
          <Sublabel label={messages.local[locale()]} />
          <Textarea
            readonly={true}
            value={JSON.stringify(props.settings, undefined, 2)}
          />
          <div class="flex justify-around my-4">
            <TextButton onClick={exportToFile}>
              {messages["save to file"][locale()]}
            </TextButton>
            <TextButton
              onClick={exportToClipboard}
            >
              {messages["export local"][locale()]}
            </TextButton>
          </div>
          <Sublabel label={messages.online[locale()]} />
          <div class="flex flex-col w-full gap-2">
            <Input
              label={messages["setting id"][locale()]}
              value={props.settings.id}
              onInput={(e: string) => {
                settingStore.setKey("id", e);
              }}
              validator={(e: string) => {
                const validId =
                  /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
                return new RegExp(validId).test(e);
              }}
              error={messages["incorrect id"][locale()]}
            />
            <TextButton onClick={exportToCloud}>
              {messages["export cloud"][locale()]}
            </TextButton>
          </div>
        </div>
      </Tabs>
      <div class="flex flex-col justify-center mt-8">
        <TextButton background={true} onClick={resetAll}>
          {messages.reset[locale()]}
        </TextButton>
      </div>
    </Categorie>
  );
};

export default Management;

interface Props {
  settings: Setting;
  reset: () => void;
}
