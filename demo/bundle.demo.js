/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./demo/demo.js":
/*!**********************!*\
  !*** ./demo/demo.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _src_core_Engine_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../src/core/Engine.js */ \"./src/core/Engine.js\");\n/* harmony import */ var _src_Objects_Actor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../src/Objects/Actor.js */ \"./src/Objects/Actor.js\");\n\r\n\r\n\r\nconst engine = new _src_core_Engine_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\r\n\r\nconst actor = new _src_Objects_Actor_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"](\r\n  (ctx) => {\r\n    ctx.fillStyle = \"#000000\";\r\n    ctx.beginPath();\r\n    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2, false);\r\n    ctx.fill();\r\n  },\r\n  () => {\r\n    pos.x += 5;\r\n  }\r\n);\r\n\r\n_src_core_Engine_js__WEBPACK_IMPORTED_MODULE_0__.actors.push(actor);\r\n\r\nengine.start();\r\n\r\nsetTimeout(() => engine.pause(), 2500);\r\n\n\n//# sourceURL=webpack://slce/./demo/demo.js?");

/***/ }),

/***/ "./src/Objects/Actor.js":
/*!******************************!*\
  !*** ./src/Objects/Actor.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _core_Engine__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Engine */ \"./src/core/Engine.js\");\n\r\n\r\n/**\r\n * An actor function represents an actor that can be placed within the canvas.\r\n * @param {Function} draw a draw function that is called every frame\r\n * @param {Function} update an update function that is called every frame\r\n * @param {Object} options optional arguments for velocity and position\r\n */\r\nconst Actor = (drawFn, updateFn, options = {}) => {\r\n    // utilize nullish coalescing operator to set default values\r\n    // by checking if vel/pos values are null or undefined\r\n    let vel = options.vel ?? {x:0, y:0};\r\n    let pos = options.pos ?? {x:0, y:0};\r\n\r\n    const draw = (ctx) => {\r\n        drawFn(ctx);\r\n    }\r\n    \r\n    const update = () => {\r\n        updateFn();\r\n        vel += _core_Engine__WEBPACK_IMPORTED_MODULE_0__.environment.physics.accel;\r\n    }      \r\n}\r\n\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Actor);\n\n//# sourceURL=webpack://slce/./src/Objects/Actor.js?");

/***/ }),

/***/ "./src/core/Engine.js":
/*!****************************!*\
  !*** ./src/core/Engine.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"actors\": () => (/* binding */ actors),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   \"environment\": () => (/* binding */ environment)\n/* harmony export */ });\n/**\r\n * An array of actors to be updated and drawn by the canvas\r\n */\r\nlet actors = [];\r\n\r\n/**\r\n * A struct of global variables.\r\n */\r\nlet environment = {\r\n  background: \"#ffffff\",\r\n  width: Math.ceil(getComputedStyle(canvasDOM).getPropertyValue(\"width\").slice(0, -2)),\r\n  height: Math.ceil(getComputedStyle(canvasDOM).getPropertyValue(\"height\").slice(0, -2)),\r\n  physics: {\r\n    accel: {x: 0, y: 5}\r\n  }\r\n}\r\n\r\n/**\r\n * A struct of debug variables.\r\n */\r\nlet debug = {\r\n  FPS: 0,\r\n  _drawFPS: true,\r\n}\r\n\r\n/**\r\n * Engine for handling game update logic and actor drawing.\r\n * @param {HTMLCanvasElement} canvasDOM canvas on which to draw to\r\n * @param {Object} options optional arguments\r\n */\r\nconst Engine = (canvasDOM, options = {}) => {\r\n  // ensure canvasDOM is valid canvas DOM element\r\n  if (!(canvasDOM instanceof HTMLCanvasElement)) {\r\n    throw new Error('canvasDOM must be a valid canvas DOM element');\r\n  }\r\n\r\n  const ctx = canvasDOM.getContext('2d');\r\n\r\n  // listen for resize events and update canvas dimensions\r\n  document.addEventListener(\"resize\", e => {\r\n    dimensions = fixDPI(canvasDOM);\r\n    // set canvas width and height to scaled width and height\r\n    environment.width = dimensions[0];\r\n    environment.height = dimensions[1];\r\n  });\r\n\r\n  /**\r\n   * Starts engine\r\n   */\r\n  const start = () => {\r\n    fix_dpi();\r\n    requestAnimationFrame(update);\r\n  }\r\n\r\n  /**\r\n   * Pauses engine\r\n   */\r\n  const pause = () => {\r\n    cancelAnimationFrame(update);\r\n  }\r\n}\r\n\r\n// Internal functions\r\n\r\nlet lastTime = 0;\r\n/**\r\n * (internal function) keeps track of FPS and updates all relevant actors\r\n * @param {Number} timestamp timestamp of current frame\r\n */\r\nconst update = (timestamp) => {\r\n  // get current FPS\r\n  let dT = timestamp - lastTime;\r\n  lastTime = timestamp;\r\n  debug.FPS = 1000 / dT;\r\n\r\n  // draw all relevant actors\r\n  draw(ctx);\r\n\r\n  // update actors\r\n  actors.forEach(actor => actor.update(dT));\r\n\r\n  // filter actors array by those that are NOT queued for disposal\r\n  actors.filter(actor => !actor.disposalQueued);\r\n\r\n  requestAnimationFrame(update);\r\n}\r\n\r\n/**\r\n * (internal function) draws all relevant actors onto canvas\r\n * @param {CanvasRenderingContext2D} ctx rendering context of canvas\r\n */\r\nconst draw = (ctx) => {\r\n  // clear canvas\r\n  ctx.clearRect(0, 0, environment.width, environment.height);\r\n  // reset context fill color\r\n  ctx.fillStyle = environment.background;\r\n  ctx.fillRect(0, 0, environemnt.width, environment.height);\r\n\r\n  actors.forEach(actor => actor.draw(ctx));\r\n\r\n  if (debug._showFPS) {\r\n    ctx.fillStyle = \"#000000\"; // TODO: remove magic number (i.e. dynamically set color to opposite of background color)\r\n    if (!isNaN(debug.FPS))\r\n      ctx.fillText(\"FPS: \" + Math.round(debug.FPS), 5, 15);\r\n  }\r\n}\r\n\r\n/**\r\n * (internal function) fixes DPI of canvas\r\n * @param {HTMLCanvasElement} canvasDOM DOM element to recalculate DPI for\r\n * @returns {[number, number]} [scaledWidth, scaledHeight]\r\n */\r\nconst fixDPI = (canvasDOM) => {\r\n  let dpi = window.devicePixelRatio;\r\n\r\n  // set current computed canvas dimensions\r\n  var style_width = getComputedStyle(canvasDOM).getPropertyValue(\"width\").slice(0, -2); //get width attribute\r\n  var style_height = getComputedStyle(canvasDOM).getPropertyValue(\"height\").slice(0, -2); //get height attribute\r\n\r\n  // scale dimensions by DPI\r\n  var w = style_width * dpi;\r\n  var h = style_height * dpi;\r\n\r\n  // set canvas element dimensions to scaled dimensions\r\n  canvasDOM.setAttribute('width', w);\r\n  canvasDOM.setAttribute('height', h);\r\n\r\n  return [w, h];\r\n}\r\n\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Engine);\r\n\n\n//# sourceURL=webpack://slce/./src/core/Engine.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./demo/demo.js");
/******/ 	
/******/ })()
;