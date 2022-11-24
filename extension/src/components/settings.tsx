import { Component, createSignal, Show } from 'solid-js';
import { sendToast } from '../../types/notification.js';
import {
  Setting,
  ShortcutSetting,
  ShortcutStyle,
} from '../../types/settings.js';
import createSettings from '../createSettings.jsx';
import {
  messages,
  helpLinks,
  AvailableLanguages,
  availableLanguages,
} from '../lang.js';
import TextButton from './controls/button.jsx';
import Categorie from './controls/categorie.jsx';
import Input from './controls/input.jsx';
import Select from './controls/select.jsx';
import Slider from './controls/slider.jsx';
import Toggle from './controls/toggle.jsx';

const SettingContent: Component<Prop> = (props) => {
  const [newShortcut, setNewShortcut] = createSignal<ShortcutSetting>({
    name: '',
    link: '',
    icon: '',
    newTab: false,
  });
  const [locale, setLocale] = createSignal(
    props.settings.general.locale as AvailableLanguages
  );
  const [inCloud, setInCloud] = createSignal(false);
  return (
    <div class='p-2 flex flex-col gap-4 mb-12'>
      <Categorie
        name={messages.general[locale()]}
        helpLink={helpLinks.base + locale() + helpLinks.general}
      >
        <Input
          label={messages.name[locale()]}
          placeholder={props.settings.general.username}
          value={props.settings.general.username}
          onInput={(e: string) => {
            props.settings.general.username = e;
            props.onUpdate(props.settings);
          }}
        />
        <Select
          label={messages.locale[locale()]}
          placeholder={props.settings.general.locale}
          value={props.settings.general.locale}
          onInput={(e: string) => {
            props.settings.general.locale = e as AvailableLanguages;
            setLocale(e as AvailableLanguages);
            props.onUpdate(props.settings);
          }}
          options={availableLanguages.map((l) => ({ value: l, name: l }))}
        />
        <Input
          label={messages.title[locale()]}
          placeholder={props.settings.general.title}
          value={props.settings.general.title}
          onInput={(e: string) => {
            props.settings.general.title = e;
            props.onUpdate(props.settings);
          }}
        />
        <Input
          label={messages.favicon[locale()]}
          placeholder={props.settings.general.favicon}
          value={props.settings.general.favicon}
          onInput={(e: string) => {
            props.settings.general.favicon = e;
            props.onUpdate(props.settings);
          }}
        />
        <Toggle
          label={messages['browser sync'][locale()]}
          onChange={(e) => {
            props.settings.general.sync = e;
            props.onUpdate(props.settings);
          }}
          checked={props.settings.layout.showClock}
        />
      </Categorie>
      <Categorie
        name={messages.layout[locale()]}
        helpLink={helpLinks.base + locale() + helpLinks.layout}
      >
        <Toggle
          label={messages['show clock'][locale()]}
          onChange={(e) => {
            props.settings.layout.showClock = e;
            props.onUpdate(props.settings);
          }}
          checked={props.settings.layout.showClock}
        />
        <Toggle
          label={messages['show date'][locale()]}
          onChange={(e) => {
            props.settings.layout.showDate = e;
            props.onUpdate(props.settings);
          }}
          checked={props.settings.layout.showDate}
        />
        <Toggle
          label={messages['show greeting'][locale()]}
          onChange={(e) => {
            props.settings.layout.showGreeting = e;
            props.onUpdate(props.settings);
          }}
          checked={props.settings.layout.showGreeting}
        />
        <Toggle
          label={messages['show searchbar'][locale()]}
          onChange={(e) => {
            props.settings.layout.showSearchbar = e;
            props.onUpdate(props.settings);
          }}
          checked={props.settings.layout.showSearchbar}
        />
        <Toggle
          label={messages['show weather'][locale()]}
          onChange={(e) => {
            props.settings.layout.showWeather = e;
            props.onUpdate(props.settings);
          }}
          checked={props.settings.layout.showWeather}
        />
        <Toggle
          label={messages['show shortcuts'][locale()]}
          onChange={(e) => {
            props.settings.layout.showShortcuts = e;
            props.onUpdate(props.settings);
          }}
          checked={props.settings.layout.showShortcuts}
        />
      </Categorie>
      <Categorie
        name={messages.background[locale()]}
        helpLink={helpLinks.base + locale() + helpLinks.background}
      >
        <Toggle
          label={messages['bg active'][locale()]}
          onChange={(e) => {
            props.settings.background.active = e;
            props.onUpdate(props.settings);
          }}
          checked={props.settings.background.active}
        />
        <Show when={props.settings.background.active}>
          <Input
            label={messages.collections[locale()]}
            placeholder={props.settings.background.collections.join(', ')}
            value={props.settings.background.collections.join(', ')}
            onInput={(e: string) => {
              props.settings.background.collections = e
                .split(',')
                .map((i) => i.trim());
              props.onUpdate(props.settings);
            }}
          />
        </Show>
        <Show when={!props.settings.background.active}>
          <Input
            label={messages['static img'][locale()]}
            placeholder={props.settings.background.static}
            value={props.settings.background.static}
            onInput={(e: string) => {
              props.settings.background.static = e;
              props.onUpdate(props.settings);
            }}
          />
          <Input
            label={messages.color[locale()]}
            placeholder={props.settings.background.color}
            value={props.settings.background.color}
            onInput={(e: string) => {
              props.settings.background.color = e;
              props.onUpdate(props.settings);
            }}
          />
        </Show>
        <Toggle
          label={messages.backdrop[locale()]}
          onChange={(e) => {
            props.settings.background.backdropActive = e;
            props.onUpdate(props.settings);
          }}
          checked={props.settings.background.backdropActive}
        />
        <Show when={props.settings.background.backdropActive}>
          <Slider
            label={messages.blur[locale()]}
            min={0}
            max={12}
            value={Number(
              props.settings.background.backdrop.blur.split('px')[0]
            )}
            onChange={(e: string) => {
              props.settings.background.backdrop.blur = e + 'px';
              props.onUpdate(props.settings);
            }}
          />
          <Slider
            label={messages.brightness[locale()]}
            min={0}
            max={200}
            value={Number(
              props.settings.background.backdrop.brightness.split('%')[0]
            )}
            onChange={(e: string) => {
              props.settings.background.backdrop.brightness = e + '%';
              props.onUpdate(props.settings);
            }}
          />
          <Slider
            label={messages.saturate[locale()]}
            min={0}
            max={200}
            value={Number(
              props.settings.background.backdrop.saturate.split('%')[0]
            )}
            onChange={(e: string) => {
              props.settings.background.backdrop.saturate = e + '%';
              props.onUpdate(props.settings);
            }}
          />
        </Show>
        <Show when={props.settings.background.active}>
          <TextButton
            onClick={async () => {
              props.onRefreshImage();
            }}
          >
            {messages['reload img'][locale()]}
          </TextButton>
        </Show>
      </Categorie>
      <Categorie
        name={messages['shortcut settings'][locale()]}
        helpLink={helpLinks.base + locale() + helpLinks.shortcut}
      >
        <Toggle
          label={messages['shortcut icon only'][locale()]}
          checked={props.settings.shortcutAppereance.iconOnly}
          onChange={(e) => {
            props.settings.shortcutAppereance.iconOnly = e;
            props.onUpdate(props.settings);
          }}
        />
        <Select
          label={messages['shortcut size'][locale()]}
          value={props.settings.shortcutAppereance.style}
          onInput={(e) => {
            props.settings.shortcutAppereance.style = e as ShortcutStyle;
            props.onUpdate(props.settings);
          }}
          options={[
            { value: 'large', name: 'large' },
            { value: 'medium', name: 'medium' },
            { value: 'small', name: 'small' },
            { value: 'text', name: 'text' },
          ]}
        />
        <Slider
          label={messages['shortcuts per line'][locale()]}
          min={1}
          max={10}
          step={1}
          value={props.settings.shortcutAppereance.elementsPerLine}
          onChange={(e) => {
            props.settings.shortcutAppereance.elementsPerLine = Number(e);
            props.onUpdate(props.settings);
          }}
          showValue={true}
        />
      </Categorie>
      <Categorie
        name={messages['new shortcut'][locale()]}
        helpLink={helpLinks.base + locale() + helpLinks.shortcut}
      >
        <Input
          label={messages['shortcut name'][locale()]}
          value={newShortcut().name}
          onInput={(e: string) => {
            newShortcut().name = e;
          }}
        />
        <Input
          label={messages['shortcut link'][locale()]}
          value={newShortcut().link}
          onInput={(e: string) => {
            newShortcut().link = e;
          }}
        />
        <Input
          label={messages['shortcut icon'][locale()]}
          value={newShortcut().icon}
          onInput={(e: string) => {
            newShortcut().icon = e;
          }}
        />
        <Toggle
          label={messages['shortcut new tab'][locale()]}
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
                  k != 'newTab' && k != 'icon' && (v == '' || v == undefined)
              )
            )
              return;
            if (!newShortcut().link.startsWith('http'))
              newShortcut().link = `https://${newShortcut().link}`;
            if (newShortcut().icon == '')
              newShortcut().icon = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${
                newShortcut().link
              }&size=128`;
            props.addShortcut(newShortcut());
            setNewShortcut({
              name: '',
              link: '',
              icon: '',
              newTab: false,
            });
          }}
        >
          {messages.add[locale()]}
        </TextButton>
      </Categorie>
      <Categorie
        name={messages['time and date'][locale()]}
        helpLink={helpLinks.base + locale() + helpLinks.time}
      >
        <Toggle
          label={messages['show seconds'][locale()]}
          onChange={(e) => {
            props.settings.clock.showSeconds = e;
            props.onUpdate(props.settings);
          }}
          checked={props.settings.clock.showSeconds}
        />
      </Categorie>
      <Categorie
        name={messages.weather[locale()]}
        helpLink={helpLinks.base + locale() + helpLinks.weather}
      >
        <Toggle
          label={messages.imperial[locale()]}
          checked={props.settings.weather.unit == 'imperial'}
          onChange={(e) => {
            props.settings.weather.unit = e ? 'imperial' : 'metric';
            props.onUpdate(props.settings);
            props.onWeatherUpdate();
          }}
        />
        <Toggle
          label={messages['show weather icon'][locale()]}
          checked={props.settings.weather.showIcon}
          onChange={(e) => {
            props.settings.weather.showIcon = e;
            props.onUpdate(props.settings);
          }}
        />
        <Toggle
          label={messages['show weather text'][locale()]}
          checked={props.settings.weather.showText}
          onChange={(e) => {
            props.settings.weather.showText = e;
            props.onUpdate(props.settings);
          }}
        />
      </Categorie>
      <Categorie
        name={messages.management[locale()]}
        helpLink={helpLinks.base + locale() + helpLinks.management}
      >
        <Toggle
          label={messages['setting in cloud'][locale()]}
          checked={inCloud()}
          onChange={(e) => {
            setInCloud(e);
          }}
        />
        <Show when={inCloud()}>
          <Input
            label={messages['setting id'][locale()]}
            value={props.settings.id}
            onInput={(e: string) => {
              props.settings.id = e;
            }}
            validator={(e: string) => {
              const validId =
                /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
              return new RegExp(validId).test(e);
            }}
            error={messages['incorrect id'][locale()]}
          />
        </Show>
        <TextButton
          onClick={async () => {
            try {
              if (inCloud()) {
                const pw = prompt('select password');
                const key = props.settings.id;
                const res = await fetch(
                  `${
                    import.meta.env.VITE_COMPANION_BASE
                  }/api/setting/${key}?p=${pw}`
                ).then((r) => r.json());
                if (res) props.onUpdate(res);
                sendToast(
                  messages['import success cloud'][locale()],
                  'success',
                  5000
                );
                return;
              }
              const settings = await navigator.clipboard.readText();
              if (JSON.parse(settings)) {
                props.onUpdate(JSON.parse(settings));
              }
              sendToast(
                messages['import success clipboard'][locale()],
                'success',
                5000
              );
            } catch (error) {
              sendToast(messages['import fail'][locale()], 'error', 5000);
            }
          }}
        >
          {messages.import[locale()]}
        </TextButton>
        <TextButton
          onClick={async () => {
            try {
              if (inCloud()) {
                const pw = prompt('select password');
                const key =
                  props.settings.id == '0'
                    ? crypto.randomUUID()
                    : props.settings.id;
                props.settings.id = key;
                await fetch(
                  `${
                    import.meta.env.VITE_COMPANION_BASE
                  }/api/setting/${key}?p=${pw}`,
                  {
                    method: 'POST',
                    body: JSON.stringify(props.settings),
                    mode: 'cors',
                  }
                );
                props.onUpdate(props.settings);
                sendToast(
                  messages['export success cloud'][locale()],
                  'success',
                  5000
                );
                return;
              }
              await navigator.clipboard.writeText(
                JSON.stringify(props.settings)
              );
              sendToast(
                messages['export success clipboard'][locale()],
                'success',
                5000
              );
            } catch (error) {
              sendToast(messages['export fail'][locale()], 'error', 5000);
            }
          }}
        >
          {messages.export[locale()]}
        </TextButton>
        <Show when={!navigator.userAgent.includes('Chrome')}>
          <Input
            label={messages['setting input'][locale()]}
            onInput={(settings) => {
              if (JSON.parse(settings)) {
                props.onUpdate(JSON.parse(settings));
              }
              sendToast(
                messages['import success clipboard'][locale()],
                'success',
                5000
              );
            }}
          />
        </Show>
        <TextButton
          onClick={async () => {
            props.onUpdate((await createSettings.getDefault()).settings);
          }}
        >
          {messages.reset[locale()]}
        </TextButton>
      </Categorie>
    </div>
  );
};

export default SettingContent;

interface Prop {
  settings: Setting;
  onUpdate: (settings: Setting) => void;
  addShortcut: (shortcut: ShortcutSetting) => void;
  onRefreshImage: () => void;
  onWeatherUpdate: () => void;
}
