import { Show, createSignal } from 'solid-js';
import type { Component } from 'solid-js';
import type { ShortcutAppereance, ShortcutSetting } from '../../../types/settings';
import { ContextMenu } from '../../components/ui/context-menu';
import { ShortcutIcon } from './shortcut-icon';
import { ShortcutPopover } from './shortcut-popover';

export interface ShortcutItemProps {
  shortcut: ShortcutSetting;
  appearance: ShortcutAppereance;
  colPercent: number;
  onEdit: (updated: ShortcutSetting) => void;
  onRemove: () => void;
}

export const ShortcutItem: Component<ShortcutItemProps> = (props) => {
  const [open, setOpen] = createSignal(false),
    size = (): number => {
      switch (props.appearance?.style) {
        case 'large': {
          return 100;
        }
        case 'medium': {
          return 75;
        }
        case 'small': {
          return 50;
        }
        default: {
          return 25;
        }
      }
    },
    textSize = (): string => {
      switch (props.appearance?.style) {
        case 'large': {
          return 'text-lg';
        }
        case 'medium': {
          return 'text-base';
        }
        case 'small': {
          return 'text-sm';
        }
        default: {
          return 'text-lg';
        }
      }
    },
    shortcutWidth = () => {
      if (props.appearance?.style === 'text') {
        return 'auto';
      }
      return `${props.appearance?.iconOnly ? size() : size() * 1.2}px`;
    },
    shortcutHeight = () => {
      if (props.appearance?.style === 'text') {
        return '50px';
      }
      return `${props.appearance?.iconOnly ? size() : size() * 1.5}px`;
    },
    shortcutPadding = () => {
      if (props.appearance?.style === 'text') {
        return '16px 8px';
      }
      return '0';
    },
    // Tile is wider than the base icon size (size * 1.2) when the label shows.
    // Render the icon at full tile width so full-bleed icons (e.g. apple-touch
    // icons with their own background color) touch the tile edges instead of
    // leaving tile-background gutters left and right.
    iconSize = () => {
      if (props.appearance?.style === 'text') {
        return 0;
      }
      return props.appearance?.iconOnly ? size() : size() * 1.2;
    };

  return (
    <ContextMenu onOpenChange={setOpen}>
      <div
        class="flex justify-center items-center relative"
        style={{
          flex: `0 0 ${props.colPercent}%`,
          height: shortcutHeight(),
          width: shortcutWidth(),
        }}
      >
        <ContextMenu.Trigger
          as="a"
          href={props.shortcut.link}
          target={props.shortcut.newTab ? '_blank' : '_self'}
          class="widget grow overflow-hidden flex flex-col items-center decoration-none transition hover:scale-105 select-none outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
          style={{
            padding: shortcutPadding(),
          }}
        >
          <Show when={size() > 25}>
            <ShortcutIcon
              link={props.shortcut.link}
              name={props.shortcut.name}
              configuredIcon={props.shortcut.icon}
              size={iconSize()}
            />
          </Show>
          <Show when={!props.appearance?.iconOnly || props.appearance?.style === 'text'}>
            <div class="h-full grid content-center">
              <span class={`px-2 ${textSize()} truncate max-w-28 text-center`}>
                {props.shortcut.name}
              </span>
            </div>
          </Show>
        </ContextMenu.Trigger>

        <ShortcutPopover
          open={open()}
          shortcut={props.shortcut}
          onSave={props.onEdit}
          onDelete={props.onRemove}
        />
      </div>
    </ContextMenu>
  );
};
