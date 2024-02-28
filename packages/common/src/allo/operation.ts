import { TinyEmitter } from "tiny-emitter";

/**
 * The `AlloOperation` class is an event-driven operation
 * that can emit and listen to events. It allows for executing asynchronous
 * operations while emitting various events during its lifecycle.
 * This class is generic by defining the expected result type `TResult`
 * and the event types `TEvents`.
 *
 * @typeparam TResult The type of the result that the operation will resolve to.
 * @typeparam TEvents A record type where keys are event names and values are the types of
 *                    arguments those events emit.
 */
export class AlloOperation<
  TResult,
  TEvents extends Record<string, unknown>,
> extends TinyEmitter {
  callback: (args: {
    emit: <K extends keyof TEvents>(event: K, ...args: TEvents[K][]) => void;
  }) => Promise<TResult>;

  /**
   * Constructs an `AlloOperation` instance.
   *
   * @param callback - The callback function to be executed when `execute` is called. This
   *                   function should contain the logic of the operation and can use the
   *                   provided `emit` function to emit events.
   */
  constructor(
    callback: (args: {
      emit: <K extends keyof TEvents>(event: K, ...args: TEvents[K][]) => void;
    }) => Promise<TResult>
  ) {
    super();
    this.callback = callback;
  }

  on<K extends keyof TEvents>(
    event: K,
    callback: (args: TEvents[K]) => void
  ): this {
    return super.on(event as string, callback);
  }

  once<K extends keyof TEvents>(
    event: K,
    callback: (args: TEvents[K]) => void
  ): this {
    return super.once(event as string, callback);
  }

  emit<K extends keyof TEvents>(event: K, ...args: TEvents[K][]): this {
    return super.emit(event as string, ...args);
  }

  off<K extends keyof TEvents>(
    event: K,
    callback?: (args: TEvents[K]) => void
  ): this {
    return super.off(event as string, callback);
  }

  waitFor<K extends keyof TEvents>(event: K): Promise<TEvents[K]> {
    return new Promise((resolve) => {
      this.once(event, resolve);
    });
  }

  map<TMappedResult>(
    mapper: (result: TResult) => TMappedResult
  ): AlloOperation<TMappedResult, TEvents> {
    return new AlloOperation(async ({ emit }) => {
      this.emit = emit as unknown as typeof this.emit;
      const result = await this.execute();
      return mapper(result);
    });
  }

  /**
   * Executes the operation. This will invoke the callback function and return its result.
   *
   * @returns A Promise that resolves to the result of the operation.
   */
  async execute(): Promise<TResult> {
    return this.callback({
      emit: (event, ...args) => {
        this.emit(event, ...args);
      },
    });
  }
}
