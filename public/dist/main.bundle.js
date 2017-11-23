/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _amber = __webpack_require__(1);

var _amber2 = _interopRequireDefault(_amber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EVENTS = {
  join: 'join',
  leave: 'leave',
  message: 'message'
};
var STALE_CONNECTION_THRESHOLD_SECONDS = 100;
var SOCKET_POLLING_RATE = 10000;

/**
 * Returns a numeric value for the current time
 */
var now = function now() {
  return new Date().getTime();
};

/**
 * Returns the difference between the current time and passed `time` in seconds
 * @param {Number|Date} time - A numeric time or date object
 */
var secondsSince = function secondsSince(time) {
  return (now() - time) / 1000;
};

/**
 * Class for channel related functions (joining, leaving, subscribing and sending messages)
 */

var Channel = exports.Channel = function () {
  /**
   * @param {String} topic - topic to subscribe to
   * @param {Socket} socket - A Socket instance
   */
  function Channel(topic, socket) {
    _classCallCheck(this, Channel);

    this.topic = topic;
    this.socket = socket;
    this.onMessageHandlers = [];
  }

  /**
   * Join a channel, subscribe to all channels messages
   */


  _createClass(Channel, [{
    key: 'join',
    value: function join() {
      this.socket.ws.send(JSON.stringify({ event: EVENTS.join, topic: this.topic }));
    }

    /**
     * Leave a channel, stop subscribing to channel messages
     */

  }, {
    key: 'leave',
    value: function leave() {
      this.socket.ws.send(JSON.stringify({ event: EVENTS.leave, topic: this.topic }));
    }

    /**
     * Calls all message handlers with a matching subject
     */

  }, {
    key: 'handleMessage',
    value: function handleMessage(msg) {
      this.onMessageHandlers.forEach(function (handler) {
        if (handler.subject === msg.subject) handler.callback(msg.payload);
      });
    }

    /**
     * Subscribe to a channel subject
     * @param {String} subject - subject to listen for: `msg:new`
     * @param {function} callback - callback function when a new message arrives
     */

  }, {
    key: 'on',
    value: function on(subject, callback) {
      this.onMessageHandlers.push({ subject: subject, callback: callback });
    }

    /**
     * Send a new message to the channel
     * @param {String} subject - subject to send message to: `msg:new`
     * @param {Object} payload - payload object: `{message: 'hello'}`
     */

  }, {
    key: 'push',
    value: function push(subject, payload) {
      this.socket.ws.send(JSON.stringify({ event: EVENTS.message, topic: this.topic, subject: subject, payload: payload }));
    }
  }]);

  return Channel;
}();

/**
 * Class for maintaining connection with server and maintaining channels list
 */


var Socket = exports.Socket = function () {
  /**
   * @param {String} endpoint - Websocket endpont used in routes.cr file
   */
  function Socket(endpoint) {
    _classCallCheck(this, Socket);

    this.endpoint = endpoint;
    this.ws = null;
    this.channels = [];
    this.lastPing = now();
    this.reconnectTries = 0;
    this.attemptReconnect = true;
  }

  /**
   * Returns whether or not the last received ping has been past the threshold
   */


  _createClass(Socket, [{
    key: '_connectionIsStale',
    value: function _connectionIsStale() {
      return secondsSince(this.lastPing) > STALE_CONNECTION_THRESHOLD_SECONDS;
    }

    /**
     * Tries to reconnect to the websocket server using a recursive timeout
     */

  }, {
    key: '_reconnect',
    value: function _reconnect() {
      var _this = this;

      this.reconnectTimeout = setTimeout(function () {
        _this.reconnectTries++;
        _this.connect(_this.params);
        _this._reconnect();
      }, this._reconnectInterval());
    }

    /**
     * Returns an incrementing timeout interval based around the number of reconnection retries
     */

  }, {
    key: '_reconnectInterval',
    value: function _reconnectInterval() {
      return [1000, 2000, 5000, 10000][this.reconnectTries] || 10000;
    }

    /**
     * Sets a recursive timeout to check if the connection is stale
     */

  }, {
    key: '_poll',
    value: function _poll() {
      var _this2 = this;

      this.pollingTimeout = setTimeout(function () {
        if (_this2._connectionIsStale()) {
          _this2._reconnect();
        } else {
          _this2._poll();
        }
      }, SOCKET_POLLING_RATE);
    }

    /**
     * Clear polling timeout and start polling
     */

  }, {
    key: '_startPolling',
    value: function _startPolling() {
      clearTimeout(this.pollingTimeout);
      this._poll();
    }

    /**
     * Sets `lastPing` to the curent time
     */

  }, {
    key: '_handlePing',
    value: function _handlePing() {
      this.lastPing = now();
    }

    /**
     * Clears reconnect timeout, resets variables an starts polling
     */

  }, {
    key: '_reset',
    value: function _reset() {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTries = 0;
      this.attemptReconnect = true;
      this._startPolling();
    }

    /**
     * Connect the socket to the server, and binds to native ws functions
     * @param {Object} params - Optional parameters
     * @param {String} params.location - Hostname to connect to, defaults to `window.location.hostname`
     * @param {String} parmas.port - Port to connect to, defaults to `window.location.port`
     * @param {String} params.protocol - Protocol to use, either 'wss' or 'ws'
     */

  }, {
    key: 'connect',
    value: function connect(params) {
      var _this3 = this;

      this.params = params;

      var opts = {
        location: window.location.hostname,
        port: window.location.port,
        protocol: window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      };

      if (params) Object.assign(opts, params);
      if (opts.port) opts.location += ':' + opts.port;

      return new Promise(function (resolve, reject) {
        _this3.ws = new WebSocket(opts.protocol + '//' + opts.location + _this3.endpoint);
        _this3.ws.onmessage = function (msg) {
          _this3.handleMessage(msg);
        };
        _this3.ws.onclose = function () {
          if (_this3.attemptReconnect) _this3._reconnect();
        };
        _this3.ws.onopen = function () {
          _this3._reset();
          resolve();
        };
      });
    }

    /**
     * Closes the socket connection permanently
     */

  }, {
    key: 'disconnect',
    value: function disconnect() {
      this.attemptReconnect = false;
      clearTimeout(this.pollingTimeout);
      clearTimeout(this.reconnectTimeout);
      this.ws.close();
    }

    /**
     * Adds a new channel to the socket channels list
     * @param {String} topic - Topic for the channel: `chat_room:123`
     */

  }, {
    key: 'channel',
    value: function channel(topic) {
      var channel = new Channel(topic, this);
      this.channels.push(channel);
      return channel;
    }

    /**
     * Message handler for messages received
     * @param {MessageEvent} msg - Message received from ws
     */

  }, {
    key: 'handleMessage',
    value: function handleMessage(msg) {
      if (msg.data === "ping") return this._handlePing();

      var parsed_msg = JSON.parse(msg.data);
      this.channels.forEach(function (channel) {
        if (channel.topic === parsed_msg.topic) channel.handleMessage(parsed_msg);
      });
    }
  }]);

  return Socket;
}();

module.exports = {
  Socket: Socket
};

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZTRiMTYyNWRiNzEzMDY1ODNmYzciLCJ3ZWJwYWNrOi8vLy4vc3JjL2Fzc2V0cy9qYXZhc2NyaXB0cy9tYWluLmpzIiwid2VicGFjazovLy8uL2xpYi9hbWJlci9hc3NldHMvanMvYW1iZXIuanMiXSwibmFtZXMiOlsiRVZFTlRTIiwiam9pbiIsImxlYXZlIiwibWVzc2FnZSIsIlNUQUxFX0NPTk5FQ1RJT05fVEhSRVNIT0xEX1NFQ09ORFMiLCJTT0NLRVRfUE9MTElOR19SQVRFIiwibm93IiwiRGF0ZSIsImdldFRpbWUiLCJzZWNvbmRzU2luY2UiLCJ0aW1lIiwiQ2hhbm5lbCIsInRvcGljIiwic29ja2V0Iiwib25NZXNzYWdlSGFuZGxlcnMiLCJ3cyIsInNlbmQiLCJKU09OIiwic3RyaW5naWZ5IiwiZXZlbnQiLCJtc2ciLCJmb3JFYWNoIiwiaGFuZGxlciIsInN1YmplY3QiLCJjYWxsYmFjayIsInBheWxvYWQiLCJwdXNoIiwiU29ja2V0IiwiZW5kcG9pbnQiLCJjaGFubmVscyIsImxhc3RQaW5nIiwicmVjb25uZWN0VHJpZXMiLCJhdHRlbXB0UmVjb25uZWN0IiwicmVjb25uZWN0VGltZW91dCIsInNldFRpbWVvdXQiLCJjb25uZWN0IiwicGFyYW1zIiwiX3JlY29ubmVjdCIsIl9yZWNvbm5lY3RJbnRlcnZhbCIsInBvbGxpbmdUaW1lb3V0IiwiX2Nvbm5lY3Rpb25Jc1N0YWxlIiwiX3BvbGwiLCJjbGVhclRpbWVvdXQiLCJfc3RhcnRQb2xsaW5nIiwib3B0cyIsImxvY2F0aW9uIiwid2luZG93IiwiaG9zdG5hbWUiLCJwb3J0IiwicHJvdG9jb2wiLCJPYmplY3QiLCJhc3NpZ24iLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIldlYlNvY2tldCIsIm9ubWVzc2FnZSIsImhhbmRsZU1lc3NhZ2UiLCJvbmNsb3NlIiwib25vcGVuIiwiX3Jlc2V0IiwiY2xvc2UiLCJjaGFubmVsIiwiZGF0YSIsIl9oYW5kbGVQaW5nIiwicGFyc2VkX21zZyIsInBhcnNlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7O0FDN0RBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNBQSxJQUFNQSxTQUFTO0FBQ2JDLFFBQU0sTUFETztBQUViQyxTQUFPLE9BRk07QUFHYkMsV0FBUztBQUhJLENBQWY7QUFLQSxJQUFNQyxxQ0FBcUMsR0FBM0M7QUFDQSxJQUFNQyxzQkFBc0IsS0FBNUI7O0FBRUE7OztBQUdBLElBQUlDLE1BQU0sU0FBTkEsR0FBTSxHQUFNO0FBQ2QsU0FBTyxJQUFJQyxJQUFKLEdBQVdDLE9BQVgsRUFBUDtBQUNELENBRkQ7O0FBSUE7Ozs7QUFJQSxJQUFJQyxlQUFlLFNBQWZBLFlBQWUsQ0FBQ0MsSUFBRCxFQUFVO0FBQzNCLFNBQU8sQ0FBQ0osUUFBUUksSUFBVCxJQUFpQixJQUF4QjtBQUNELENBRkQ7O0FBSUE7Ozs7SUFHYUMsTyxXQUFBQSxPO0FBQ1g7Ozs7QUFJQSxtQkFBWUMsS0FBWixFQUFtQkMsTUFBbkIsRUFBMkI7QUFBQTs7QUFDekIsU0FBS0QsS0FBTCxHQUFhQSxLQUFiO0FBQ0EsU0FBS0MsTUFBTCxHQUFjQSxNQUFkO0FBQ0EsU0FBS0MsaUJBQUwsR0FBeUIsRUFBekI7QUFDRDs7QUFFRDs7Ozs7OzsyQkFHTztBQUNMLFdBQUtELE1BQUwsQ0FBWUUsRUFBWixDQUFlQyxJQUFmLENBQW9CQyxLQUFLQyxTQUFMLENBQWUsRUFBRUMsT0FBT25CLE9BQU9DLElBQWhCLEVBQXNCVyxPQUFPLEtBQUtBLEtBQWxDLEVBQWYsQ0FBcEI7QUFDRDs7QUFFRDs7Ozs7OzRCQUdRO0FBQ04sV0FBS0MsTUFBTCxDQUFZRSxFQUFaLENBQWVDLElBQWYsQ0FBb0JDLEtBQUtDLFNBQUwsQ0FBZSxFQUFFQyxPQUFPbkIsT0FBT0UsS0FBaEIsRUFBdUJVLE9BQU8sS0FBS0EsS0FBbkMsRUFBZixDQUFwQjtBQUNEOztBQUVEOzs7Ozs7a0NBR2NRLEcsRUFBSztBQUNqQixXQUFLTixpQkFBTCxDQUF1Qk8sT0FBdkIsQ0FBK0IsVUFBQ0MsT0FBRCxFQUFhO0FBQzFDLFlBQUlBLFFBQVFDLE9BQVIsS0FBb0JILElBQUlHLE9BQTVCLEVBQXFDRCxRQUFRRSxRQUFSLENBQWlCSixJQUFJSyxPQUFyQjtBQUN0QyxPQUZEO0FBR0Q7O0FBRUQ7Ozs7Ozs7O3VCQUtHRixPLEVBQVNDLFEsRUFBVTtBQUNwQixXQUFLVixpQkFBTCxDQUF1QlksSUFBdkIsQ0FBNEIsRUFBRUgsU0FBU0EsT0FBWCxFQUFvQkMsVUFBVUEsUUFBOUIsRUFBNUI7QUFDRDs7QUFFRDs7Ozs7Ozs7eUJBS0tELE8sRUFBU0UsTyxFQUFTO0FBQ3JCLFdBQUtaLE1BQUwsQ0FBWUUsRUFBWixDQUFlQyxJQUFmLENBQW9CQyxLQUFLQyxTQUFMLENBQWUsRUFBRUMsT0FBT25CLE9BQU9HLE9BQWhCLEVBQXlCUyxPQUFPLEtBQUtBLEtBQXJDLEVBQTRDVyxTQUFTQSxPQUFyRCxFQUE4REUsU0FBU0EsT0FBdkUsRUFBZixDQUFwQjtBQUNEOzs7Ozs7QUFHSDs7Ozs7SUFHYUUsTSxXQUFBQSxNO0FBQ1g7OztBQUdBLGtCQUFZQyxRQUFaLEVBQXNCO0FBQUE7O0FBQ3BCLFNBQUtBLFFBQUwsR0FBZ0JBLFFBQWhCO0FBQ0EsU0FBS2IsRUFBTCxHQUFVLElBQVY7QUFDQSxTQUFLYyxRQUFMLEdBQWdCLEVBQWhCO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQnhCLEtBQWhCO0FBQ0EsU0FBS3lCLGNBQUwsR0FBc0IsQ0FBdEI7QUFDQSxTQUFLQyxnQkFBTCxHQUF3QixJQUF4QjtBQUNEOztBQUVEOzs7Ozs7O3lDQUdxQjtBQUNuQixhQUFPdkIsYUFBYSxLQUFLcUIsUUFBbEIsSUFBOEIxQixrQ0FBckM7QUFDRDs7QUFFRDs7Ozs7O2lDQUdhO0FBQUE7O0FBQ1gsV0FBSzZCLGdCQUFMLEdBQXdCQyxXQUFXLFlBQU07QUFDdkMsY0FBS0gsY0FBTDtBQUNBLGNBQUtJLE9BQUwsQ0FBYSxNQUFLQyxNQUFsQjtBQUNBLGNBQUtDLFVBQUw7QUFDRCxPQUp1QixFQUlyQixLQUFLQyxrQkFBTCxFQUpxQixDQUF4QjtBQUtEOztBQUVEOzs7Ozs7eUNBR3FCO0FBQ25CLGFBQU8sQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLElBQWIsRUFBbUIsS0FBbkIsRUFBMEIsS0FBS1AsY0FBL0IsS0FBa0QsS0FBekQ7QUFDRDs7QUFFRDs7Ozs7OzRCQUdRO0FBQUE7O0FBQ04sV0FBS1EsY0FBTCxHQUFzQkwsV0FBVyxZQUFNO0FBQ3JDLFlBQUksT0FBS00sa0JBQUwsRUFBSixFQUErQjtBQUM3QixpQkFBS0gsVUFBTDtBQUNELFNBRkQsTUFFTztBQUNMLGlCQUFLSSxLQUFMO0FBQ0Q7QUFDRixPQU5xQixFQU1uQnBDLG1CQU5tQixDQUF0QjtBQU9EOztBQUVEOzs7Ozs7b0NBR2dCO0FBQ2RxQyxtQkFBYSxLQUFLSCxjQUFsQjtBQUNBLFdBQUtFLEtBQUw7QUFDRDs7QUFFRDs7Ozs7O2tDQUdjO0FBQ1osV0FBS1gsUUFBTCxHQUFnQnhCLEtBQWhCO0FBQ0Q7O0FBRUQ7Ozs7Ozs2QkFHUztBQUNQb0MsbUJBQWEsS0FBS1QsZ0JBQWxCO0FBQ0EsV0FBS0YsY0FBTCxHQUFzQixDQUF0QjtBQUNBLFdBQUtDLGdCQUFMLEdBQXdCLElBQXhCO0FBQ0EsV0FBS1csYUFBTDtBQUNEOztBQUVEOzs7Ozs7Ozs7OzRCQU9RUCxNLEVBQVE7QUFBQTs7QUFDZCxXQUFLQSxNQUFMLEdBQWNBLE1BQWQ7O0FBRUEsVUFBSVEsT0FBTztBQUNUQyxrQkFBVUMsT0FBT0QsUUFBUCxDQUFnQkUsUUFEakI7QUFFVEMsY0FBTUYsT0FBT0QsUUFBUCxDQUFnQkcsSUFGYjtBQUdUQyxrQkFBVUgsT0FBT0QsUUFBUCxDQUFnQkksUUFBaEIsS0FBNkIsUUFBN0IsR0FBd0MsTUFBeEMsR0FBaUQ7QUFIbEQsT0FBWDs7QUFNQSxVQUFJYixNQUFKLEVBQVljLE9BQU9DLE1BQVAsQ0FBY1AsSUFBZCxFQUFvQlIsTUFBcEI7QUFDWixVQUFJUSxLQUFLSSxJQUFULEVBQWVKLEtBQUtDLFFBQUwsVUFBcUJELEtBQUtJLElBQTFCOztBQUVmLGFBQU8sSUFBSUksT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUN0QyxlQUFLdkMsRUFBTCxHQUFVLElBQUl3QyxTQUFKLENBQWlCWCxLQUFLSyxRQUF0QixVQUFtQ0wsS0FBS0MsUUFBeEMsR0FBbUQsT0FBS2pCLFFBQXhELENBQVY7QUFDQSxlQUFLYixFQUFMLENBQVF5QyxTQUFSLEdBQW9CLFVBQUNwQyxHQUFELEVBQVM7QUFBRSxpQkFBS3FDLGFBQUwsQ0FBbUJyQyxHQUFuQjtBQUF5QixTQUF4RDtBQUNBLGVBQUtMLEVBQUwsQ0FBUTJDLE9BQVIsR0FBa0IsWUFBTTtBQUN0QixjQUFJLE9BQUsxQixnQkFBVCxFQUEyQixPQUFLSyxVQUFMO0FBQzVCLFNBRkQ7QUFHQSxlQUFLdEIsRUFBTCxDQUFRNEMsTUFBUixHQUFpQixZQUFNO0FBQ3JCLGlCQUFLQyxNQUFMO0FBQ0FQO0FBQ0QsU0FIRDtBQUlELE9BVk0sQ0FBUDtBQVdEOztBQUVEOzs7Ozs7aUNBR2E7QUFDWCxXQUFLckIsZ0JBQUwsR0FBd0IsS0FBeEI7QUFDQVUsbUJBQWEsS0FBS0gsY0FBbEI7QUFDQUcsbUJBQWEsS0FBS1QsZ0JBQWxCO0FBQ0EsV0FBS2xCLEVBQUwsQ0FBUThDLEtBQVI7QUFDRDs7QUFFRDs7Ozs7Ozs0QkFJUWpELEssRUFBTztBQUNiLFVBQUlrRCxVQUFVLElBQUluRCxPQUFKLENBQVlDLEtBQVosRUFBbUIsSUFBbkIsQ0FBZDtBQUNBLFdBQUtpQixRQUFMLENBQWNILElBQWQsQ0FBbUJvQyxPQUFuQjtBQUNBLGFBQU9BLE9BQVA7QUFDRDs7QUFFRDs7Ozs7OztrQ0FJYzFDLEcsRUFBSztBQUNqQixVQUFJQSxJQUFJMkMsSUFBSixLQUFhLE1BQWpCLEVBQXlCLE9BQU8sS0FBS0MsV0FBTCxFQUFQOztBQUV6QixVQUFJQyxhQUFhaEQsS0FBS2lELEtBQUwsQ0FBVzlDLElBQUkyQyxJQUFmLENBQWpCO0FBQ0EsV0FBS2xDLFFBQUwsQ0FBY1IsT0FBZCxDQUFzQixVQUFDeUMsT0FBRCxFQUFhO0FBQ2pDLFlBQUlBLFFBQVFsRCxLQUFSLEtBQWtCcUQsV0FBV3JELEtBQWpDLEVBQXdDa0QsUUFBUUwsYUFBUixDQUFzQlEsVUFBdEI7QUFDekMsT0FGRDtBQUdEOzs7Ozs7QUFHSEUsT0FBT0MsT0FBUCxHQUFpQjtBQUNmekMsVUFBUUE7QUFETyxDQUFqQixDIiwiZmlsZSI6Im1haW4uYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL2Rpc3RcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAwKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBlNGIxNjI1ZGI3MTMwNjU4M2ZjNyIsImltcG9ydCBBbWJlciBmcm9tICdhbWJlcidcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9hc3NldHMvamF2YXNjcmlwdHMvbWFpbi5qcyIsImNvbnN0IEVWRU5UUyA9IHtcbiAgam9pbjogJ2pvaW4nLFxuICBsZWF2ZTogJ2xlYXZlJyxcbiAgbWVzc2FnZTogJ21lc3NhZ2UnXG59XG5jb25zdCBTVEFMRV9DT05ORUNUSU9OX1RIUkVTSE9MRF9TRUNPTkRTID0gMTAwXG5jb25zdCBTT0NLRVRfUE9MTElOR19SQVRFID0gMTAwMDBcblxuLyoqXG4gKiBSZXR1cm5zIGEgbnVtZXJpYyB2YWx1ZSBmb3IgdGhlIGN1cnJlbnQgdGltZVxuICovXG5sZXQgbm93ID0gKCkgPT4ge1xuICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKClcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIGN1cnJlbnQgdGltZSBhbmQgcGFzc2VkIGB0aW1lYCBpbiBzZWNvbmRzXG4gKiBAcGFyYW0ge051bWJlcnxEYXRlfSB0aW1lIC0gQSBudW1lcmljIHRpbWUgb3IgZGF0ZSBvYmplY3RcbiAqL1xubGV0IHNlY29uZHNTaW5jZSA9ICh0aW1lKSA9PiB7XG4gIHJldHVybiAobm93KCkgLSB0aW1lKSAvIDEwMDBcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgY2hhbm5lbCByZWxhdGVkIGZ1bmN0aW9ucyAoam9pbmluZywgbGVhdmluZywgc3Vic2NyaWJpbmcgYW5kIHNlbmRpbmcgbWVzc2FnZXMpXG4gKi9cbmV4cG9ydCBjbGFzcyBDaGFubmVsIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0b3BpYyAtIHRvcGljIHRvIHN1YnNjcmliZSB0b1xuICAgKiBAcGFyYW0ge1NvY2tldH0gc29ja2V0IC0gQSBTb2NrZXQgaW5zdGFuY2VcbiAgICovXG4gIGNvbnN0cnVjdG9yKHRvcGljLCBzb2NrZXQpIHtcbiAgICB0aGlzLnRvcGljID0gdG9waWNcbiAgICB0aGlzLnNvY2tldCA9IHNvY2tldFxuICAgIHRoaXMub25NZXNzYWdlSGFuZGxlcnMgPSBbXVxuICB9XG5cbiAgLyoqXG4gICAqIEpvaW4gYSBjaGFubmVsLCBzdWJzY3JpYmUgdG8gYWxsIGNoYW5uZWxzIG1lc3NhZ2VzXG4gICAqL1xuICBqb2luKCkge1xuICAgIHRoaXMuc29ja2V0LndzLnNlbmQoSlNPTi5zdHJpbmdpZnkoeyBldmVudDogRVZFTlRTLmpvaW4sIHRvcGljOiB0aGlzLnRvcGljIH0pKVxuICB9XG5cbiAgLyoqXG4gICAqIExlYXZlIGEgY2hhbm5lbCwgc3RvcCBzdWJzY3JpYmluZyB0byBjaGFubmVsIG1lc3NhZ2VzXG4gICAqL1xuICBsZWF2ZSgpIHtcbiAgICB0aGlzLnNvY2tldC53cy5zZW5kKEpTT04uc3RyaW5naWZ5KHsgZXZlbnQ6IEVWRU5UUy5sZWF2ZSwgdG9waWM6IHRoaXMudG9waWMgfSkpXG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgYWxsIG1lc3NhZ2UgaGFuZGxlcnMgd2l0aCBhIG1hdGNoaW5nIHN1YmplY3RcbiAgICovXG4gIGhhbmRsZU1lc3NhZ2UobXNnKSB7XG4gICAgdGhpcy5vbk1lc3NhZ2VIYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICBpZiAoaGFuZGxlci5zdWJqZWN0ID09PSBtc2cuc3ViamVjdCkgaGFuZGxlci5jYWxsYmFjayhtc2cucGF5bG9hZClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byBhIGNoYW5uZWwgc3ViamVjdFxuICAgKiBAcGFyYW0ge1N0cmluZ30gc3ViamVjdCAtIHN1YmplY3QgdG8gbGlzdGVuIGZvcjogYG1zZzpuZXdgXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gY2FsbGJhY2sgZnVuY3Rpb24gd2hlbiBhIG5ldyBtZXNzYWdlIGFycml2ZXNcbiAgICovXG4gIG9uKHN1YmplY3QsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5vbk1lc3NhZ2VIYW5kbGVycy5wdXNoKHsgc3ViamVjdDogc3ViamVjdCwgY2FsbGJhY2s6IGNhbGxiYWNrIH0pXG4gIH1cblxuICAvKipcbiAgICogU2VuZCBhIG5ldyBtZXNzYWdlIHRvIHRoZSBjaGFubmVsXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzdWJqZWN0IC0gc3ViamVjdCB0byBzZW5kIG1lc3NhZ2UgdG86IGBtc2c6bmV3YFxuICAgKiBAcGFyYW0ge09iamVjdH0gcGF5bG9hZCAtIHBheWxvYWQgb2JqZWN0OiBge21lc3NhZ2U6ICdoZWxsbyd9YFxuICAgKi9cbiAgcHVzaChzdWJqZWN0LCBwYXlsb2FkKSB7XG4gICAgdGhpcy5zb2NrZXQud3Muc2VuZChKU09OLnN0cmluZ2lmeSh7IGV2ZW50OiBFVkVOVFMubWVzc2FnZSwgdG9waWM6IHRoaXMudG9waWMsIHN1YmplY3Q6IHN1YmplY3QsIHBheWxvYWQ6IHBheWxvYWQgfSkpXG4gIH1cbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgbWFpbnRhaW5pbmcgY29ubmVjdGlvbiB3aXRoIHNlcnZlciBhbmQgbWFpbnRhaW5pbmcgY2hhbm5lbHMgbGlzdFxuICovXG5leHBvcnQgY2xhc3MgU29ja2V0IHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBlbmRwb2ludCAtIFdlYnNvY2tldCBlbmRwb250IHVzZWQgaW4gcm91dGVzLmNyIGZpbGVcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVuZHBvaW50KSB7XG4gICAgdGhpcy5lbmRwb2ludCA9IGVuZHBvaW50XG4gICAgdGhpcy53cyA9IG51bGxcbiAgICB0aGlzLmNoYW5uZWxzID0gW11cbiAgICB0aGlzLmxhc3RQaW5nID0gbm93KClcbiAgICB0aGlzLnJlY29ubmVjdFRyaWVzID0gMFxuICAgIHRoaXMuYXR0ZW1wdFJlY29ubmVjdCA9IHRydWVcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBsYXN0IHJlY2VpdmVkIHBpbmcgaGFzIGJlZW4gcGFzdCB0aGUgdGhyZXNob2xkXG4gICAqL1xuICBfY29ubmVjdGlvbklzU3RhbGUoKSB7XG4gICAgcmV0dXJuIHNlY29uZHNTaW5jZSh0aGlzLmxhc3RQaW5nKSA+IFNUQUxFX0NPTk5FQ1RJT05fVEhSRVNIT0xEX1NFQ09ORFNcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmllcyB0byByZWNvbm5lY3QgdG8gdGhlIHdlYnNvY2tldCBzZXJ2ZXIgdXNpbmcgYSByZWN1cnNpdmUgdGltZW91dFxuICAgKi9cbiAgX3JlY29ubmVjdCgpIHtcbiAgICB0aGlzLnJlY29ubmVjdFRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMucmVjb25uZWN0VHJpZXMrK1xuICAgICAgdGhpcy5jb25uZWN0KHRoaXMucGFyYW1zKVxuICAgICAgdGhpcy5fcmVjb25uZWN0KClcbiAgICB9LCB0aGlzLl9yZWNvbm5lY3RJbnRlcnZhbCgpKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gaW5jcmVtZW50aW5nIHRpbWVvdXQgaW50ZXJ2YWwgYmFzZWQgYXJvdW5kIHRoZSBudW1iZXIgb2YgcmVjb25uZWN0aW9uIHJldHJpZXNcbiAgICovXG4gIF9yZWNvbm5lY3RJbnRlcnZhbCgpIHtcbiAgICByZXR1cm4gWzEwMDAsIDIwMDAsIDUwMDAsIDEwMDAwXVt0aGlzLnJlY29ubmVjdFRyaWVzXSB8fCAxMDAwMFxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYSByZWN1cnNpdmUgdGltZW91dCB0byBjaGVjayBpZiB0aGUgY29ubmVjdGlvbiBpcyBzdGFsZVxuICAgKi9cbiAgX3BvbGwoKSB7XG4gICAgdGhpcy5wb2xsaW5nVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX2Nvbm5lY3Rpb25Jc1N0YWxlKCkpIHtcbiAgICAgICAgdGhpcy5fcmVjb25uZWN0KClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3BvbGwoKVxuICAgICAgfVxuICAgIH0sIFNPQ0tFVF9QT0xMSU5HX1JBVEUpXG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgcG9sbGluZyB0aW1lb3V0IGFuZCBzdGFydCBwb2xsaW5nXG4gICAqL1xuICBfc3RhcnRQb2xsaW5nKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLnBvbGxpbmdUaW1lb3V0KVxuICAgIHRoaXMuX3BvbGwoKVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYGxhc3RQaW5nYCB0byB0aGUgY3VyZW50IHRpbWVcbiAgICovXG4gIF9oYW5kbGVQaW5nKCkge1xuICAgIHRoaXMubGFzdFBpbmcgPSBub3coKVxuICB9XG5cbiAgLyoqXG4gICAqIENsZWFycyByZWNvbm5lY3QgdGltZW91dCwgcmVzZXRzIHZhcmlhYmxlcyBhbiBzdGFydHMgcG9sbGluZ1xuICAgKi9cbiAgX3Jlc2V0KCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLnJlY29ubmVjdFRpbWVvdXQpXG4gICAgdGhpcy5yZWNvbm5lY3RUcmllcyA9IDBcbiAgICB0aGlzLmF0dGVtcHRSZWNvbm5lY3QgPSB0cnVlXG4gICAgdGhpcy5fc3RhcnRQb2xsaW5nKClcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25uZWN0IHRoZSBzb2NrZXQgdG8gdGhlIHNlcnZlciwgYW5kIGJpbmRzIHRvIG5hdGl2ZSB3cyBmdW5jdGlvbnNcbiAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyAtIE9wdGlvbmFsIHBhcmFtZXRlcnNcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhcmFtcy5sb2NhdGlvbiAtIEhvc3RuYW1lIHRvIGNvbm5lY3QgdG8sIGRlZmF1bHRzIHRvIGB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWVgXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXJtYXMucG9ydCAtIFBvcnQgdG8gY29ubmVjdCB0bywgZGVmYXVsdHMgdG8gYHdpbmRvdy5sb2NhdGlvbi5wb3J0YFxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGFyYW1zLnByb3RvY29sIC0gUHJvdG9jb2wgdG8gdXNlLCBlaXRoZXIgJ3dzcycgb3IgJ3dzJ1xuICAgKi9cbiAgY29ubmVjdChwYXJhbXMpIHtcbiAgICB0aGlzLnBhcmFtcyA9IHBhcmFtc1xuXG4gICAgbGV0IG9wdHMgPSB7XG4gICAgICBsb2NhdGlvbjogd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLFxuICAgICAgcG9ydDogd2luZG93LmxvY2F0aW9uLnBvcnQsXG4gICAgICBwcm90b2NvbDogd2luZG93LmxvY2F0aW9uLnByb3RvY29sID09PSAnaHR0cHM6JyA/ICd3c3M6JyA6ICd3czonLFxuICAgIH1cblxuICAgIGlmIChwYXJhbXMpIE9iamVjdC5hc3NpZ24ob3B0cywgcGFyYW1zKVxuICAgIGlmIChvcHRzLnBvcnQpIG9wdHMubG9jYXRpb24gKz0gYDoke29wdHMucG9ydH1gXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy53cyA9IG5ldyBXZWJTb2NrZXQoYCR7b3B0cy5wcm90b2NvbH0vLyR7b3B0cy5sb2NhdGlvbn0ke3RoaXMuZW5kcG9pbnR9YClcbiAgICAgIHRoaXMud3Mub25tZXNzYWdlID0gKG1zZykgPT4geyB0aGlzLmhhbmRsZU1lc3NhZ2UobXNnKSB9XG4gICAgICB0aGlzLndzLm9uY2xvc2UgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmF0dGVtcHRSZWNvbm5lY3QpIHRoaXMuX3JlY29ubmVjdCgpXG4gICAgICB9XG4gICAgICB0aGlzLndzLm9ub3BlbiA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlcyB0aGUgc29ja2V0IGNvbm5lY3Rpb24gcGVybWFuZW50bHlcbiAgICovXG4gIGRpc2Nvbm5lY3QoKSB7XG4gICAgdGhpcy5hdHRlbXB0UmVjb25uZWN0ID0gZmFsc2VcbiAgICBjbGVhclRpbWVvdXQodGhpcy5wb2xsaW5nVGltZW91dClcbiAgICBjbGVhclRpbWVvdXQodGhpcy5yZWNvbm5lY3RUaW1lb3V0KVxuICAgIHRoaXMud3MuY2xvc2UoKVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBuZXcgY2hhbm5lbCB0byB0aGUgc29ja2V0IGNoYW5uZWxzIGxpc3RcbiAgICogQHBhcmFtIHtTdHJpbmd9IHRvcGljIC0gVG9waWMgZm9yIHRoZSBjaGFubmVsOiBgY2hhdF9yb29tOjEyM2BcbiAgICovXG4gIGNoYW5uZWwodG9waWMpIHtcbiAgICBsZXQgY2hhbm5lbCA9IG5ldyBDaGFubmVsKHRvcGljLCB0aGlzKVxuICAgIHRoaXMuY2hhbm5lbHMucHVzaChjaGFubmVsKVxuICAgIHJldHVybiBjaGFubmVsXG4gIH1cblxuICAvKipcbiAgICogTWVzc2FnZSBoYW5kbGVyIGZvciBtZXNzYWdlcyByZWNlaXZlZFxuICAgKiBAcGFyYW0ge01lc3NhZ2VFdmVudH0gbXNnIC0gTWVzc2FnZSByZWNlaXZlZCBmcm9tIHdzXG4gICAqL1xuICBoYW5kbGVNZXNzYWdlKG1zZykge1xuICAgIGlmIChtc2cuZGF0YSA9PT0gXCJwaW5nXCIpIHJldHVybiB0aGlzLl9oYW5kbGVQaW5nKClcblxuICAgIGxldCBwYXJzZWRfbXNnID0gSlNPTi5wYXJzZShtc2cuZGF0YSlcbiAgICB0aGlzLmNoYW5uZWxzLmZvckVhY2goKGNoYW5uZWwpID0+IHtcbiAgICAgIGlmIChjaGFubmVsLnRvcGljID09PSBwYXJzZWRfbXNnLnRvcGljKSBjaGFubmVsLmhhbmRsZU1lc3NhZ2UocGFyc2VkX21zZylcbiAgICB9KVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBTb2NrZXQ6IFNvY2tldFxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbGliL2FtYmVyL2Fzc2V0cy9qcy9hbWJlci5qcyJdLCJzb3VyY2VSb290IjoiIn0=