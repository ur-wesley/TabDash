import type { Component } from 'solid-js';
import { fileToIconDataUrl } from '../../api/iconUpload.js';
import { useI18n } from '../../i18n';
import { Button } from '../../components/ui/button';

export interface IconUploadProps {
  onIcon: (dataUrl: string) => void;
}

/** Upload button that turns an image file into a small icon data URL. */
export const IconUpload: Component<IconUploadProps> = (props) => {
  const { t } = useI18n(),
    pickFile = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.addEventListener('change', () => {
        void (async () => {
          const file = input.files?.[0];
          input.remove();
          if (!file) {
            return;
          }
          try {
            props.onIcon(await fileToIconDataUrl(file));
          } catch {
            // Keep the previous icon value on failure
          }
        })();
      });
      input.click();
    };

  return (
    <Button variant="outline" size="sm" class="w-full" onClick={pickFile}>
      {t('upload icon')}
    </Button>
  );
};
