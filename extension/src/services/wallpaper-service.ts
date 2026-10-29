import { ResultAsync } from '@ur-wesley/ts-prelude/result';
import type { BackgroundData } from '../../types/settings';
import {
  clearBuffer,
  consumeNextImage,
  readBufferFromStorage,
  replenishBuffer,
} from '../api/imageBuffer';
import type { CachedImage } from '../api/imageBuffer';

class WallpaperService {
  public consumeNext(collections: string[] = []): ResultAsync<BackgroundData | null, Error> {
    return ResultAsync.fromPromise(consumeNextImage(collections), (e) =>
      e instanceof Error ? e : new Error(String(e)),
    );
  }

  public replenish(collections: string[] = []): ResultAsync<CachedImage[], Error> {
    return ResultAsync.fromPromise(replenishBuffer(collections), (e) =>
      e instanceof Error ? e : new Error(String(e)),
    );
  }

  public clear(): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(clearBuffer(), (e) =>
      e instanceof Error ? e : new Error(String(e)),
    );
  }

  public getState(): ResultAsync<CachedImage[], Error> {
    return ResultAsync.fromPromise(readBufferFromStorage(), (e) =>
      e instanceof Error ? e : new Error(String(e)),
    );
  }
}

const wallpaperService = new WallpaperService();

export { WallpaperService, wallpaperService };
