import type { Component, JSX } from 'solid-js';
import { ContextMenu } from '../../components/ui/context-menu';
import { useI18n } from '../../i18n';

interface WidgetContextMenuProps {
  readonly title: string;
  readonly disabled?: boolean;
  readonly content: JSX.Element;
  readonly children: JSX.Element;
}

/**
 * Keeps the native menu for editable fields: stops the event before it
 * reaches the Kobalte trigger on an ancestor.
 */
function guardEditableFields(event: MouseEvent): void {
  const { target } = event;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  if (target.closest('input, textarea, select, [contenteditable="true"]') !== null) {
    event.stopPropagation();
  }
}

/**
 * Wraps any dashboard widget and opens a glass-styled settings popup on right-click,
 * mirroring the quicklinks (shortcuts) behaviour. Built on Kobalte's ContextMenu
 * primitive so nested floating UI (e.g. Select dropdowns) doesn't dismiss the popup.
 */
const WidgetContextMenu: Component<WidgetContextMenuProps> = (props) => {
  const { t } = useI18n();

  return (
    <ContextMenu>
      <ContextMenu.Trigger disabled={props.disabled} class="contents">
        <div class="contents" onContextMenu={guardEditableFields}>
          {props.children}
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Header title={props.title} closeLabel={t('close')} />
        {props.content}
      </ContextMenu.Content>
    </ContextMenu>
  );
};

export { type WidgetContextMenuProps, WidgetContextMenu };
