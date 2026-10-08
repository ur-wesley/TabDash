import { type Component, createSignal, splitProps } from 'solid-js';
import { cn } from '../../lib/utils';

export interface FileInputProps {
  label: string;
  accept?: string;
  onFileRead: (content: string) => void;
  class?: string;
  disabled?: boolean;
}

export const FileInput: Component<FileInputProps> = (props) => {
  const [local, others] = splitProps(props, ['label', 'accept', 'onFileRead', 'class', 'disabled']);
  const [dragOver, setDragOver] = createSignal(false);
  let fileInputRef: HTMLInputElement | undefined;

  const readFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.readAsText(file);
    reader.addEventListener('load', () => {
      const data = reader.result;
      if (typeof data === 'string') {
        local.onFileRead(data);
      }
    });
    setDragOver(false);
  };

  return (
    <div class={cn('w-full min-w-0 my-3', local.class)}>
      <input
        ref={(el) => {
          fileInputRef = el;
        }}
        type="file"
        accept={local.accept ?? '.json'}
        class="sr-only"
        disabled={local.disabled}
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (file) {
            readFile(file);
          }
          // Reset so the same file can be re-selected if needed
          e.currentTarget.value = '';
        }}
      />
      <button
        type="button"
        disabled={local.disabled}
        class={cn(
          'w-full h-24 p-4 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 cursor-pointer outline-none select-none',
          'focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
          dragOver()
            ? 'border-[var(--primary)] bg-[var(--primary-drop-wash)] text-[var(--primary-fg-vivid)]'
            : 'border-[var(--border-upload)] bg-[var(--upload-bg)] text-[var(--fg-muted)] hover:border-[var(--border-upload-hover)] hover:bg-[var(--upload-bg-hover)]',
          local.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        )}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
          const file = e.dataTransfer?.files[0];
          if (file) {
            readFile(file);
          }
        }}
        onClick={() => {
          fileInputRef?.click();
        }}
        {...others}
      >
        <span class="i-mdi-upload text-2xl text-[var(--fg-static-muted)]" aria-hidden="true" />
        <span class="text-sm font-medium">{local.label}</span>
      </button>
    </div>
  );
};
