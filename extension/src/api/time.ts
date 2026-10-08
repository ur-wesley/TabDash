import type { DateSetting } from '../../types/settings.js';

class Time {
  public locale: string;
  public showSeconds: boolean;
  public dateSetting?: DateSetting;

  constructor(locale: string, showSeconds: boolean, dateSetting?: DateSetting) {
    this.locale = locale ?? 'en';
    this.showSeconds = showSeconds ?? false;
    this.dateSetting = dateSetting;
  }
  public getTime(): string {
    try {
      return new Date().toLocaleTimeString(this.locale, {
        hour: 'numeric',
        minute: 'numeric',
        second: this.showSeconds ? 'numeric' : undefined,
      });
    } catch {
      return new Date().toLocaleTimeString('en', {
        hour: 'numeric',
        minute: 'numeric',
        second: this.showSeconds ? 'numeric' : undefined,
      });
    }
  }

  public getDate(): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: (this.dateSetting?.weekday as Intl.DateTimeFormatOptions['weekday']) ?? 'long',
      day: (this.dateSetting?.date as Intl.DateTimeFormatOptions['day']) ?? '2-digit',
      month: (this.dateSetting?.month as Intl.DateTimeFormatOptions['month']) ?? 'long',
    };
    try {
      return new Date().toLocaleDateString(this.locale, options);
    } catch {
      return new Date().toLocaleDateString('en', options);
    }
  }

  public format(time: number | string, showSeconds: boolean = false): string {
    try {
      return new Date(time).toLocaleTimeString(this.locale, {
        hour: 'numeric',
        minute: 'numeric',
        second: showSeconds ? 'numeric' : undefined,
      });
    } catch {
      return new Date(time).toLocaleTimeString('en', {
        hour: 'numeric',
        minute: 'numeric',
        second: showSeconds ? 'numeric' : undefined,
      });
    }
  }
}

export default Time;
