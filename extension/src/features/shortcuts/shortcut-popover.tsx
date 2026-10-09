import { createEffect, createSignal } from 'solid-js';
import type { Component } from 'solid-js';
import { useMenuContext } from '@kobalte/core/menu';
import type { ShortcutSetting } from '../../../types/settings';
import { Button } from '../../components/ui/button';
import { ContextMenu } from '../../components/ui/context-menu';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { useI18n } from '../../i18n';
import { IconUpload } from './icon-upload';

export interface ShortcutPopoverProps {
  open: boolean;
  shortcut: ShortcutSetting;
  onSave: (updated: ShortcutSetting) => void;
  onDelete: () => void;
}

export const ShortcutPopover: Component<ShortcutPopoverProps> = (props) => {
  const { t } = useI18n(),
    menu = useMenuContext(),
    [name, setName] = createSignal(props.shortcut.name),
    [link, setLink] = createSignal(props.shortcut.link),
    [icon, setIcon] = createSignal(props.shortcut.icon ?? ''),
    [newTab, setNewTab] = createSignal(props.shortcut.newTab ?? false);

  createEffect(() => {
    if (props.open) {
      setName(props.shortcut.name);
      setLink(props.shortcut.link);
      setIcon(props.shortcut.icon ?? '');
      setNewTab(props.shortcut.newTab ?? false);
    }
  });

  const handleSave = () => {
      props.onSave({
        icon: icon(),
        link: link(),
        name: name(),
        newTab: newTab(),
      });
      menu.close();
    },
    handleDelete = () => {
      props.onDelete();
      menu.close();
    };

  return (
    <ContextMenu.Content>
      <ContextMenu.Header title={t('edit')} closeLabel={t('close')} />

      <Input
        label={t('shortcut name')}
        value={name()}
        onInput={(e) => setName(e.currentTarget.value)}
      />
      <Input
        label={t('shortcut link')}
        value={link()}
        onInput={(e) => setLink(e.currentTarget.value)}
      />
      <Input
        label={t('shortcut icon')}
        value={icon()}
        onInput={(e) => setIcon(e.currentTarget.value)}
      />
      <IconUpload onIcon={setIcon} />
      <Button variant="outline" size="sm" class="w-full" onClick={() => setIcon('')}>
        {t('automatic')}
      </Button>
      <Switch label={t('new tab')} checked={newTab()} onChange={(val) => setNewTab(val)} />

      <div class="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/10">
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          {t('delete')}
        </Button>
        <Button variant="default" size="sm" onClick={handleSave}>
          {t('save')}
        </Button>
      </div>
    </ContextMenu.Content>
  );
};
