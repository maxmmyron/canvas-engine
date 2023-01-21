import Scene from "../elements/scene";
import { assert } from "../util/asserts";
import Debugger from "./gui";
import { EventHandler } from "../util/event_handler";
import { vec } from "../math/vector";
import ParameterGUI from "./gui";

const TARGET_FPS: number = 60;
const MAX_UPDATES_PER_FRAME: number = 240;

/**
 * Engine class. Handles actor management, update game loop, and rendering.
 *
 * @class
 */
export default class Engine implements Engineable {

  /**
   * Canvas element on which to attach context and event listeners
   *
   * @readonly
   */
  readonly canvasElement: HTMLCanvasElement;

  /**
   * Canvas context to draw to. Initialized on engine start.
   *
   * @readonly
   */
  readonly ctx: CanvasRenderingContext2D;

  /**
   * The engine's parameter
   *
   * @readonly
   */
  readonly parameterGUI: GUIable

  /**
   * An eventHandler used to manage event listeners.
   *
   * @readonly
   */
  readonly eventHandler: EventHandler;

  /**
   * A map containing string IDs and associated scenes.
   *
   * @default new Map()
   */
  scenes: Map<string, Scene> = new Map();

  /**
   * The current camera used to render the scene.
   *
   * @default null
   */
  camera: Camerable | null = null;

  /**
   * A count of actors that have been successfully preloaded.
   * Used during engine start to determine preload progress.
   *
   * @default 0
   */
  preloadedActorCount: number = 0;

  /**
   * The current size of the canvas element.
   *
   * @private
   */
  private _canvasSize: Vector;

  /**
   * The current engine runtime in milliseconds.
   *
   * @private
   * @default 0
   */
  private _engineRuntimeMilliseconds: number = 0;

  /**
   * High-res timestamp of engine start.
   *
   * @private
   * @default 0
   */
  private _engineStartTimestamp: number = 0;

  /**
   * The current FPS of the engine.
   *
   * @private
   * @default 0
   */
  private _FPS: number = 0;

  /**
   * Whether or not the engine has paused ticks and render calls.
   *
   * @private
   * @default false
   */
  private _isPaused: boolean = false;

  /**
   * Whether or not the engine has been initialized. This flag only changes
   * once during the engine's lifetime.
   *
   * @private
   * @default false
   */
  private isStarted: boolean = false;

  /**
   * Whether or not the engine has finished preload operations.
   *
   * @private
   * @default false
   */
  private isPreloaded: boolean = false;

  /**
   * The total number of actors that are currently in the engine.
   * Used to determine preload progress.
   *
   * @private
   * @default 0
   */
  private totalActorCount: number = 0;

  /**
   * Accumulated lag time between updates in ms. Used to determine how many
   * updates to perform in a single frame.
   */
  private lag: number = 0;

  /**
   * Maximum number of updates to perform between draw calls. If this number is
   * exceeded, the engine will panic and reset the lag accumulator.
   *
   * @default MAX_UPDATES_PER_FRAME
   */
  private readonly maxUpdatesPerFrame: number = MAX_UPDATES_PER_FRAME;

  /**
   * The previous high-res timestamp of the engine in milliseconds. Used to calculate the
   * delta time between frames.
   *
   * @private
   * @default 0
   */
  private previousUpdateTimestamp: DOMHighResTimeStamp = 0;

  /**
   * Ideal tick duration in milliseconds. Used for update calculations.
   *
   * @default 1000 / TARGET_FPS
   */
  private readonly targetTickDurationMilliseconds: number = 1000 / TARGET_FPS;

  /**
   * Current ID of update loop.
   *
   * @private
   * @default -1
   * @unused
   */
  private updateID: number = -1;

  /**
   * Number of ticks that have occurred since engine start. Used to calculate
   * FPS.
   *
   * @private
   * @default 0
   * @unused
   */
  private updatesSinceEngineStart: number = 0;

  /**
   * The current rendering scale of the canvas. At a low level, this value is
   * equivalent to the window device pixel ratio.
   *
   * @private
   * @default 1
   */
  private canvasScale: number = 1;

  /**
   * Creates a new Engine instance.
   *
   * @param canvasElement the canvas element to render to.
   * @param defaultProperties default properties to apply to the engine.
   */
  constructor(canvasElement: HTMLCanvasElement, defaultProperties: Partial<DefaultEngineProperties> = {}) {
    this.canvasElement = canvasElement;

    this.ctx = <CanvasRenderingContext2D>canvasElement.getContext("2d");

    this.eventHandler = EventHandler.getInstance();

    this._canvasSize = this.fixDPI();

    this.parameterGUI = new ParameterGUI();
    this.parameterGUI.baseSection
      .addParameter("FPS", () => this._FPS)
      .addParameter("runtime", () => ((performance.now() - this._engineRuntimeMilliseconds) / 1000))
      .addParameter("tick lag", () => this.lag);
  }

  getScenesByName = (name: string): Array<Scene> => Array.from(this.scenes.values()).filter((scene) => scene.name === name);

  /**
   * Starts engine update loop. Used only once at startup.
   *
   * @throws {Error} if the start function has already been called.
   */
  start = async (): Promise<void> => {
    assert(!this.isStarted, "Engine has already been started.");

    this.fixDPI();

    this.canvasElement.tabIndex = -1;
    this.canvasElement.focus();

    this.eventHandler.addListener("onresize", () => this._canvasSize = this.fixDPI());

    this.eventHandler.addListener("onmousedown", (ev) => {
      ev = <MouseEventPayload>ev;
      this.parameterGUI.lastClickPosition = vec(ev.x, ev.y);
    });

    this.updateID = requestAnimationFrame(this.update);

    this.totalActorCount = Array.from(this.scenes.values()).reduce((acc, scene) => acc + scene.actors.size, 0);

    await Promise.all(Array.from(this.scenes.values()).map((scene) => scene.start()));

    this.eventHandler.attachEventListeners(this.canvasElement);

    this.isPreloaded = true;
    this.isStarted = true;

    this._engineStartTimestamp = performance.now();
    this.updatePauseState(false);
  };

  /**
   * Pauses engine tick and render functions. The Engine will continue calling
   * the outer loop, but will not perform any logic.
   */
  pause = (): void => this.updatePauseState(true);

  /**
   * Resumes engine update loop.
   */
  resume = (): void => this.updatePauseState(false);

  /**
   * Creates a new event listener for the given event name.
   *
   * @param eventName the event name to listen for
   * @param callback a callback that is executed when the event is fired
   */
  addListener = (eventName: ValidEventType, callback: ((ev: ValidEventPayload) => void)): void => this.eventHandler.addListener(eventName, callback);

  /**
   * Removes an existing event listener for the given event name.
   *
   * @param eventName the event name from which to remove the listener
   * @param callback a reference to the callback to remove
   */
  removeListener = (eventName: ValidEventType, callback: ((ev: ValidEventPayload) => void)): void => this.eventHandler.removeListener(eventName, callback);

  /**
   * Performs general update logic and manages tick cycle.
   *
   * @private
   *
   * @param timestamp a timestamp provided by the browser to determine the delta
   * time since the last update.
   */
  private update = (timestamp: DOMHighResTimeStamp) => {
    this.updateID = requestAnimationFrame(this.update);

    if (!this.isPreloaded) {
      this.render(0);
      return;
    }

    const delta = timestamp - this.previousUpdateTimestamp;
    this.previousUpdateTimestamp = timestamp;

    this.lag += delta;
    this._engineRuntimeMilliseconds += delta;

    this._FPS = 1000 / delta;

    let cycleUpdateCount = 0;
    while (this.lag >= this.targetTickDurationMilliseconds && !this.isPaused) {
      this.eventHandler.queueEvent("ontick", { deltaTime: this.targetTickDurationMilliseconds });

      Array.from(this.scenes.values())
        .filter(scene => scene.isTickEnabled)
        .forEach(scene => scene.tick(this.targetTickDurationMilliseconds));

      this.eventHandler.dispatchQueue();

      this.lag -= this.targetTickDurationMilliseconds;

      this.updatesSinceEngineStart++;

      if (++cycleUpdateCount >= this.maxUpdatesPerFrame) {
        this.lag = 0;
        break;
      }
    }

    this.render(this.lag / this.targetTickDurationMilliseconds);

    this.scenes = new Map(Array
      .from(this.scenes.entries())
      .filter(([key, scene]) => !(scene.isQueuedForDisposal && this.removeScene(scene))));
  };

  /**
   * Draws relevant elements onto the context
   *
   * @private
   *
   * @param {number} interpolationFactor interpolation value
   */
  private render = (interpolationFactor: number) => {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    this.ctx.scale(this.canvasScale, this.canvasScale);

    if (!this.isPreloaded) this.renderPreloadScreen();
    if (this._isPaused || !this.isPreloaded) return;

    this.ctx.clearRect(0, 0, this._canvasSize.x, this._canvasSize.y);

    Array.from(this.scenes.values()).filter(scene => scene.isRenderEnabled).forEach(scene => scene.render(interpolationFactor));

    this.eventHandler.queueEvent("onrender", { interpolationFactor });

    this.parameterGUI.render(this.ctx);
  };

  /**
   * Renders the preload screen.
   *
   * @private
   */
  private renderPreloadScreen(): void {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvasSize.x, this.canvasSize.y);

    this.ctx.font = "30px monospace";
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("LOADING...", this.canvasSize.x / 2, this.canvasSize.y / 2);

    this.ctx.strokeStyle = "white";
    this.ctx.strokeRect(this.canvasSize.x / 2 - 200, this.canvasSize.y / 2 + 32, 400, 16);
    this.ctx.fillRect(this.canvasSize.x / 2 - 200, this.canvasSize.y / 2 + 32, 400 * this.preloadedActorCount / this.totalActorCount, 16);
  }

  /**
   * Normalizes the canvas size towards device DPI
   *
   * @private
   *
    * @returns the normalized canvas size
   */
  //TODO: potentially rename?
  private fixDPI = (): Vector => {
    this.canvasScale = window.devicePixelRatio;

    let width: number = Number(getComputedStyle(this.canvasElement)
      .getPropertyValue("width")
      .slice(0, -2));
    let height: number = Number(getComputedStyle(this.canvasElement)
      .getPropertyValue("height")
      .slice(0, -2));

    width *= this.canvasScale;
    height *= this.canvasScale;

    this.canvasElement.setAttribute("width", String(width));
    this.canvasElement.setAttribute("height", String(height));

    return vec(width, height);
  };

  /**
   * Updates the pause state of the game. This is wrapped since multiple separate
   * systems may need to be "paused" pause the game.
   *
   * @private
   *
   * @param isPaused whether or not the engine is paused
   */
  // TODO: update eventHandler to accept arrow func reference instead of variable
  private updatePauseState = (isPaused: boolean) => {
    this._isPaused = isPaused;
    this.eventHandler.setIsEnginePaused(isPaused);
  }

  /**
   * Removes a scene from the engine.
   *
   * @private
   *
   * @param scene the scene to remove from the engine
   */
  private removeScene = (scene: Scene) => {
    this.scenes.delete(scene.ID);
  }

  get canvasSize(): Vector {
    return this._canvasSize;
  }

  get engineRuntimeMilliseconds(): number {
    return this._engineRuntimeMilliseconds;
  }

  get engineStartTimestamp(): number {
    return this._engineStartTimestamp;
  }

  get FPS(): number {
    return this._FPS;
  }

  get isPaused(): boolean {
    return this._isPaused;
  }
}
