import { TinyEmitter } from "tiny-emitter";

export class AlloOperation<
  TResult,
  TEvents extends Record<string, unknown>,
> extends TinyEmitter {
  callback: (args: {
    emit: <K extends keyof TEvents>(event: K, ...args: TEvents[K][]) => void;
  }) => Promise<TResult>;

  constructor(
    callback: (args: {
      emit: <K extends keyof TEvents>(event: K, ...args: TEvents[K][]) => void;
    }) => Promise<TResult>,
  ) {
    super();
    this.callback = callback;
  }

  on<K extends keyof TEvents>(
    event: K,
    callback: (args: TEvents[K]) => void,
  ): this {
    return super.on(event as string, callback);
  }

  once<K extends keyof TEvents>(
    event: K,
    callback: (args: TEvents[K]) => void,
  ): this {
    return super.once(event as string, callback);
  }

  emit<K extends keyof TEvents>(event: K, ...args: TEvents[K][]): this {
    return super.emit(event as string, ...args);
  }

  off<K extends keyof TEvents>(
    event: K,
    callback?: (args: TEvents[K]) => void,
  ): this {
    return super.off(event as string, callback);
  }

  waitFor<K extends keyof TEvents>(event: K): Promise<TEvents[K]> {
    return new Promise((resolve) => {
      this.once(event, resolve);
    });
  }

  async execute(): Promise<TResult> {
    return this.callback({
      emit: (event, ...args) => {
        super.emit(event as string, ...args);
      },
    });
  }
}
