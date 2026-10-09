import type { Component } from 'solid-js';
import type { Setting } from '../../../types/settings';
import { Button } from '../../components/ui/button';
import { FileInput } from '../../components/ui/file-input';
import { toast } from '../../components/ui/sonner';
import { useI18n } from '../../i18n';
import { syncService } from '../../services/sync-service';
import { CategorySection } from './category-section';
import { useSettingsContext } from './settings-context';

export const ManagementTab: Component = () => {
  const { t } = useI18n(),
    [state, actions] = useSettingsContext(),
    importFromClipboard = async () => {
      const res = await syncService.readClipboard();
      if (res.isOk()) {
        try {
          const parsed = JSON.parse(res.value) as Partial<Setting>;
          actions.setSettings({
            ...state,
            ...parsed,
          });
          toast.success(t('import success clipboard'));
        } catch {
          toast.error(t('import fail'));
        }
      } else {
        toast.error(t('import fail'));
      }
    },
    exportToClipboard = async () => {
      const payload = JSON.stringify({ ...state, cache: { images: [] } }, undefined, 2),
        res = await syncService.writeClipboard(payload);
      if (res.isOk()) {
        toast.success(t('export success clipboard'));
      } else {
        toast.error(t('export fail'));
      }
    },
    importFromCloud = async () => {
      const pw = prompt(t('select export password')) ?? undefined,
        res = await syncService.fetchFromCloud(state.id, pw);
      if (res.isOk()) {
        actions.setSettings(res.value);
        toast.success(t('import success cloud'));
      } else {
        toast.error(t('import fail'));
      }
    },
    exportToCloud = async () => {
      const pw = prompt(t('select export password')) ?? undefined,
        payload: Setting = {
          ...state,
          cache: { images: [] },
        },
        res = await syncService.saveToCloud(state.id, payload, pw);
      if (res.isOk()) {
        toast.success(t('export success cloud'));
      } else {
        toast.error(t('export fail'));
      }
    },
    handleFileImport = (content: string) => {
      try {
        const parsed = JSON.parse(content) as Partial<Setting>;
        actions.setSettings({
          ...state,
          ...parsed,
        });
        toast.success(t('import success file'));
      } catch {
        toast.error(t('import fail'));
      }
    },
    handleExportFile = () => {
      try {
        const payload = JSON.stringify({ ...state, cache: { images: [] } }, undefined, 2),
          blob = new Blob([payload], { type: 'application/json' }),
          url = URL.createObjectURL(blob),
          a = document.createElement('a');
        a.href = url;
        a.download = `tabdash-settings-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t('export success file'));
      } catch {
        toast.error(t('export fail'));
      }
    },
    handleReset = async () => {
      if (confirm('Are you sure you want to reset all settings to defaults?')) {
        await actions.resetToDefault();
        toast.success('Settings reset to defaults');
      }
    };

  return (
    <div class="w-full min-w-0 flex flex-col gap-4">
      <CategorySection title={t('clipboard')}>
        <div class="grid grid-cols-2 gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            class="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-slate-200/80 dark:border-zinc-700/80 bg-white/70 dark:bg-zinc-800/60 hover:bg-blue-500/10 hover:border-blue-500/40 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-xs group font-medium"
            onClick={() => void importFromClipboard()}
          >
            <span
              class="i-mdi-clipboard-arrow-down text-base text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform"
              aria-hidden="true"
            />
            <span class="truncate">{t('import clipboard')}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            class="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-slate-200/80 dark:border-zinc-700/80 bg-white/70 dark:bg-zinc-800/60 hover:bg-indigo-500/10 hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-xs group font-medium"
            onClick={() => void exportToClipboard()}
          >
            <span
              class="i-mdi-clipboard-arrow-up text-base text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform"
              aria-hidden="true"
            />
            <span class="truncate">{t('export clipboard')}</span>
          </Button>
        </div>
      </CategorySection>

      <CategorySection title={t('file')}>
        <FileInput label={t('import file')} onFileRead={handleFileImport} />
        <Button
          variant="outline"
          size="sm"
          class="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-slate-200/80 dark:border-zinc-700/80 bg-white/70 dark:bg-zinc-800/60 hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-xs group font-medium"
          onClick={handleExportFile}
        >
          <span
            class="i-mdi-download text-base text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform"
            aria-hidden="true"
          />
          <span>{t('export file')}</span>
        </Button>
      </CategorySection>

      <CategorySection title={t('cloud')}>
        <div class="grid grid-cols-2 gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            class="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-slate-200/80 dark:border-zinc-700/80 bg-white/70 dark:bg-zinc-800/60 hover:bg-violet-500/10 hover:border-violet-500/40 hover:text-violet-600 dark:hover:text-violet-400 transition-all shadow-xs group font-medium"
            onClick={() => void importFromCloud()}
          >
            <span
              class="i-mdi-cloud-download text-base text-violet-500 dark:text-violet-400 group-hover:scale-110 transition-transform"
              aria-hidden="true"
            />
            <span class="truncate">{t('import cloud')}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            class="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-slate-200/80 dark:border-zinc-700/80 bg-white/70 dark:bg-zinc-800/60 hover:bg-purple-500/10 hover:border-purple-500/40 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-xs group font-medium"
            onClick={() => void exportToCloud()}
          >
            <span
              class="i-mdi-cloud-upload text-base text-purple-500 dark:text-purple-400 group-hover:scale-110 transition-transform"
              aria-hidden="true"
            />
            <span class="truncate">{t('export cloud')}</span>
          </Button>
        </div>
      </CategorySection>

      <CategorySection title={t('management')}>
        <Button
          variant="destructive"
          size="sm"
          class="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 hover:border-red-500/50 shadow-xs active:bg-red-500/25 transition-all font-medium group cursor-pointer"
          onClick={() => void handleReset()}
        >
          <span
            class="i-mdi-restore text-base text-red-500 group-hover:rotate-45 transition-transform"
            aria-hidden="true"
          />
          <span>{t('reset to default')}</span>
        </Button>
      </CategorySection>
    </div>
  );
};
