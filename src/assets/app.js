/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunk"] = self["webpackChunk"] || []).push([["app"],{

/***/ "./resources/app.js":
/*!**************************!*\
  !*** ./resources/app.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var picoapp__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! picoapp */ \"./node_modules/picoapp/dist/picoapp.es.js\");\n // import frontpageTop from './js/components/frontpageTop';\n// import blandSelvSlik from './js/custom/blandSelvSlik';\n// import cart from './js/templates/cart';\n// import tutorialPopups from './js/components/tutorialPopups';\n// import collection from './js/templates/collection';\n// import product from './js/templates/product';\n// import customScrollbar from './js/components/customScrollbar';\n// import header from './js/templates/header';\n// require('./css/app.css');\n// const app = picoapp({\n//   frontpageTop,\n//   blandSelvSlik,\n//   cart,\n//   tutorialPopups,\n//   collection,\n//   product,\n//   customScrollbar,\n//   header,\n// });\n\nconst app = (0,picoapp__WEBPACK_IMPORTED_MODULE_0__.picoapp)();\napp.hydrate({\n  cart: theme.settings.cart,\n  cartTotal: theme.settings.cart.total_price\n}); // window.app = app;\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (app);\n\n//# sourceURL=webpack:///./resources/app.js?");

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ "use strict";
/******/ 
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__("./resources/app.js"));
/******/ }
]);