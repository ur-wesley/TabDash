class Time {
  public locale: string;
  public showSeconds: boolean;
  constructor(locale: string, showSeconds: boolean) {
    this.locale = locale ?? "en";
    this.showSeconds = showSeconds ?? false;
  }
  public getTime(): string {
    try {
      return new Date().toLocaleTimeString(this.locale, {
        hour: "numeric",
        minute: "numeric",
        second: this.showSeconds ? "numeric" : undefined,
      });
    } catch (error) {
      return new Date().toLocaleTimeString("en", {
        hour: "numeric",
        minute: "numeric",
        second: this.showSeconds ? "numeric" : undefined,
      });
    }
  }

  public getDate(): string {
    try {
      return new Date().toLocaleDateString(this.locale, {
        weekday: "long",
        day: "2-digit",
        month: "long",
      });
    } catch (error) {
      return new Date().toLocaleDateString("en", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      });
    }
  }

  public format(time: number | string, showSeconds: boolean = false): string {
    try {
      return new Date(time).toLocaleTimeString(this.locale, {
        hour: "numeric",
        minute: "numeric",
        second: showSeconds ? "numeric" : undefined,
      });
    } catch (error) {
      return new Date(time).toLocaleTimeString("en", {
        hour: "numeric",
        minute: "numeric",
        second: showSeconds ? "numeric" : undefined,
      });
    }
  }
}

export default Time;
