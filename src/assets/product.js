/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunk"] = self["webpackChunk"] || []).push([["product"],{

/***/ "./resources/js/templates/product.js":
/*!*******************************************!*\
  !*** ./resources/js/templates/product.js ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.array.concat.js */ \"./node_modules/core-js/modules/es.array.concat.js\");\n/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var picoapp__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! picoapp */ \"./node_modules/picoapp/dist/picoapp.es.js\");\n\n\nvar product = (0,picoapp__WEBPACK_IMPORTED_MODULE_1__.component)(function (node) {\n  var data = JSON.parse(node.querySelector('.js-data').innerHTML);\n\n  var initOptions = function initOptions() {\n    var addToCart = node.querySelector('.js-add-to-cart');\n    var price = node.querySelector('.js-price');\n    var compareAtPrice = node.querySelector('.js-compare-at-price');\n\n    var callback = function callback(variant) {\n      if (variant) {\n        price.innerHTML = Shopify.formatMoney(variant.price, theme.moneyFormat);\n\n        if (variant.compare_at_price > variant.price) {\n          compareAtPrice.hidden = false;\n          compareAtPrice.innerHTML = Shopify.formatMoney(variant.compare_at_price, theme.moneyFormat);\n        } else {\n          compareAtPrice.hidden = true;\n        }\n\n        if (variant.available) {\n          addToCart.innerHTML = theme.strings.addToCart;\n          addToCart.disabled = false;\n        } else {\n          addToCart.innerHTML = theme.strings.soldOut;\n          addToCart.disabled = true;\n        }\n      } else {\n        addToCart.innerHTML = theme.strings.unavailable;\n        addToCart.disabled = true;\n      }\n    };\n\n    var init = function init() {\n      return new Shopify.OptionSelectors(\"product-\".concat(data.id), {\n        product: data,\n        onVariantSelected: callback,\n        enableHistoryState: true\n      });\n    };\n\n    init();\n  };\n\n  var initRecommendations = function initRecommendations() {\n    var element = node.querySelector('.js-recommendations');\n    var _element$dataset = element.dataset,\n        productId = _element$dataset.productId,\n        baseUrl = _element$dataset.baseUrl,\n        limit = _element$dataset.limit;\n    var request = new XMLHttpRequest();\n    request.open('GET', \"\".concat(baseUrl, \"?section_id=template-product-recommendations&product_id=\").concat(productId, \"&limit=\").concat(limit));\n\n    request.onload = function () {\n      if (request.status >= 200 && request.status < 300) {\n        var container = document.createElement('div');\n        container.innerHTML = request.response;\n        element.parentElement.innerHTML = container.querySelector('#shopify-section-template-product-recommendations').innerHTML;\n      }\n    };\n\n    request.send();\n  };\n\n  initOptions();\n  initRecommendations();\n});\nvar app = (0,picoapp__WEBPACK_IMPORTED_MODULE_1__.picoapp)({\n  product: product\n});\napp.mount();\n\n//# sourceURL=webpack:///./resources/js/templates/product.js?");

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ "use strict";
/******/ 
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["polyfills"], function() { return __webpack_exec__("./resources/js/templates/product.js"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);