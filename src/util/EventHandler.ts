export default class EventHandler implements EventHandlerable {
  /**
   * A map of event names to their respective arrays of registered callbacks.
   */
  private callbackRegistry: { [Type in keyof EngineEventHandlersEventMap]: EngineEventCallback<Type>[] } = {
    "onmousedown": [],
    "whilemousedown": [],
    "onmouseup": [],
    "onmousemove": [],
    "onkeydown": [],
    "whilekeydown": [],
    "onkeyup": [],
    "onresize": [],
    "ontick": [],
    "onrender": []
  };

  private queuedEventPayloads: { [Type in keyof EngineEventHandlersEventMap]: EngineEventPayload<Type>[] } = {
    "onmousedown": [],
    "whilemousedown": [],
    "onmouseup": [],
    "onmousemove": [],
    "onkeydown": [],
    "whilekeydown": [],
    "onkeyup": [],
    "onresize": [],
    "ontick": [],
    "onrender": []
  };

  private resizeObserver: ResizeObserver;

  private canvas: HTMLCanvasElement;

  private canvasEventHandlerMap: Map<string, ((event: any) => any) | null> = new Map([
    ["mousedown", (event: any) => {
      event = event as MouseEvent;
      this.queueEvent("onmousedown", { type: "onmousedown", button: event.button, x: event.offsetX, y: event.offsetY });
    }],
    ["mouseup", (event: any) => {
      event = event as MouseEvent;
      this.queueEvent("onmouseup", { type: "onmouseup", button: event.button, x: event.offsetX, y: event.offsetY });
    }],
    ["mousemove", (event: any) => {
      event = event as MouseEvent;
      this.queueEvent("onmousemove", { type: "onmousemove", button: event.button, x: event.offsetX, y: event.offsetY });
    }],
    ["keydown", (event: any) => {
      event = event as KeyboardEvent
      this.queueEvent("onkeydown", { type: "onkeydown", key: event.key });
    }],
    ["keyup", (event: any) => {
      event = event as KeyboardEvent
      this.queueEvent("onkeyup", { type: "onkeyup", key: event.key });
    }],
    ["resize", null]
  ]);

  private enginePauseStateCallback: () => boolean = () => false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      this.queueEvent("onresize", { type: "onresize", width: entry.contentRect.width, height: entry.contentRect.height });
    });

    this.attachEventListeners();
  }

  destroy(): void {
    this.detachEventListeners();

    for (const type of Object.keys(this.callbackRegistry)) {
      this.callbackRegistry[type as keyof EngineEventHandlersEventMap] = [];
      this.queuedEventPayloads[type as keyof EngineEventHandlersEventMap] = [];
    }

    this.resizeObserver.disconnect();
  }

  registerEventCallback = <Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void => {
    this.callbackRegistry[type].push(callback);
  };

  unregisterEventCallback<Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void {
    this.callbackRegistry[type].splice(this.callbackRegistry[type].indexOf(callback), 1);
  }

  queueEvent<Type extends keyof EngineEventHandlersEventMap>(type: Type, payload: EngineEventPayload<Type>): void {
    if(!this.enginePauseStateCallback()) return;

    // switch through possible events, and perform special queue logic.
    // ideally this can be done in a more elegant way but that is future me's problem. For now, a brute-force switch
    // statement works just fine.

    switch (type) {
      case "onmousedown":
        this.queuedEventPayloads[type].push(payload);
        this.queuedEventPayloads["whilemousedown"].push(<MouseEventPayload>{
          ...payload,
          type: "whilemousedown"
        });
        break;
      case "onmouseup":
        this.queuedEventPayloads[type].push(payload);
        this.queuedEventPayloads["whilemousedown"] = this.queuedEventPayloads["whilemousedown"].filter((event: EngineEventPayload<"whilemousedown">) => event.button !== (<MouseEventPayload>payload).button);
        break;
      case "onkeydown":
        this.queuedEventPayloads[type].push(payload);
        this.queuedEventPayloads["whilekeydown"].push(<KeyEventPayload>{
          ...payload,
          type: "whilekeydown"
        });
        break;
      case "onkeyup":
        this.queuedEventPayloads[type].push(payload);
        this.queuedEventPayloads["whilekeydown"] = this.queuedEventPayloads["whilekeydown"].filter((event: EngineEventPayload<"whilekeydown">) => event.key !== (<KeyEventPayload>payload).key);
        break;
      default:
        this.queuedEventPayloads[type].push(payload);
        break;
    }
  }

  dispatchQueue(): void {
    for(const type in this.queuedEventPayloads) {
      const registeredCallbacks = this.callbackRegistry[type as keyof EngineEventHandlersEventMap] as EngineEventCallback<keyof EngineEventHandlersEventMap>[];
      const queuedPayloads = this.queuedEventPayloads[type as keyof EngineEventHandlersEventMap] as EngineEventPayload<keyof EngineEventHandlersEventMap>[];

      registeredCallbacks.forEach((callback) => queuedPayloads.forEach((payload) => callback(payload)));

      for(let i = 0; i < queuedPayloads.length; i++) {
        if(type === "whilemousedown" || type === "whilekeydown") continue;
        queuedPayloads.splice(i, 1);
      }
    }
  }

  attachEventListeners(): void {
    this.canvasEventHandlerMap.forEach((handler, type) => {
      switch(type) {
        case "resize":
          this.resizeObserver.observe(this.canvas);
          break;
        default:
          this.canvas.addEventListener(type as keyof HTMLElementEventMap, handler as (event: any) => any);
          break;
      }
    });
  }

  detachEventListeners(): void {
    this.canvasEventHandlerMap.forEach((handler, type) => {
      switch(type) {
        case "resize":
          this.resizeObserver.unobserve(this.canvas);
          this.resizeObserver.disconnect();
          break;
        default:
          this.canvas.removeEventListener(type as keyof HTMLElementEventMap, handler as (event: any) => any);
          break;
      }
    });
  }

  setEnginePauseStateCallback(callback: () => boolean): void {
    this.enginePauseStateCallback = callback;
  }

  getRegisteredCallbacks<Type extends keyof EngineEventHandlersEventMap>(type: Type): EngineEventCallback<Type>[] {
    return this.callbackRegistry[type];
  }

  getQueuedPayloads<Type extends keyof EngineEventHandlersEventMap>(type: Type): EngineEventPayload<Type>[] {
    return this.queuedEventPayloads[type];
  }
}
