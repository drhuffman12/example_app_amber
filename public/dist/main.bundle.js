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

/*
* Returns a numeric value for the current time
*/
var now = function now() {
  return new Date().getTime();
};

/*
* Returns the difference between the current time and passed `time` in seconds
* @param {Number|Date} time - A numeric time or date object
*/
var secondsSince = function secondsSince(time) {
  return (now() - time) / 1000;
};

/*
* Class for channel related functions (joining, leaving, subscribing and sending messages)
*/

var Channel = exports.Channel = function () {
  /*
  * @param {String} topic - topic to subscribe to
  * @param {Socket} socket - A Socket instance
  */
  function Channel(topic, socket) {
    _classCallCheck(this, Channel);

    this.topic = topic;
    this.socket = socket;
    this.onMessageHandlers = [];
  }

  /*
  * Join a channel, subscribe to all channels messages
  */


  _createClass(Channel, [{
    key: 'join',
    value: function join() {
      this.socket.ws.send(JSON.stringify({ event: EVENTS.join, topic: this.topic }));
    }

    /*
    * Leave a channel, stop subscribing to channel messages
    */

  }, {
    key: 'leave',
    value: function leave() {
      this.socket.ws.send(JSON.stringify({ event: EVENTS.leave, topic: this.topic }));
    }

    /*
    * Calls all message handlers with a matching subject
    */

  }, {
    key: 'handleMessage',
    value: function handleMessage(msg) {
      this.onMessageHandlers.forEach(function (handler) {
        if (handler.subject === msg.subject) handler.callback(msg.payload);
      });
    }

    /*
    * Subscribe to a channel subject
    * @params {String} subject - subject to listen for: `msg:new`
    * @params (function) callback - callback function when a new message arrives
    */

  }, {
    key: 'on',
    value: function on(subject, callback) {
      this.onMessageHandlers.push({ subject: subject, callback: callback });
    }

    /*
    * Send a new message to the channel
    * @params {String} subject - subject to send message to: `msg:new`
    * @params {Object} payload - payload object: `{message: 'hello'}`
    */

  }, {
    key: 'push',
    value: function push(subject, payload) {
      this.socket.ws.send(JSON.stringify({ event: EVENTS.message, topic: this.topic, subject: subject, payload: payload }));
    }
  }]);

  return Channel;
}();

/*
* Class for maintaining connection with server and maintaining channels list
*/


var Socket = exports.Socket = function () {
  /*
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

  /*
  * Returns whether or not the last received ping has been past the threshold
  */


  _createClass(Socket, [{
    key: '_connectionIsStale',
    value: function _connectionIsStale() {
      return secondsSince(this.lastPing) > STALE_CONNECTION_THRESHOLD_SECONDS;
    }

    /*
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

    /*
    * Returns an incrementing timeout interval based around the number of reconnection retries
    */

  }, {
    key: '_reconnectInterval',
    value: function _reconnectInterval() {
      return [1000, 2000, 5000, 10000][this.reconnectTries] || 10000;
    }

    /*
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

    /*
    * Clear polling timeout and start polling
    */

  }, {
    key: '_startPolling',
    value: function _startPolling() {
      clearTimeout(this.pollingTimeout);
      this._poll();
    }

    /*
    * Sets `lastPing` to the curent time
    */

  }, {
    key: '_handlePing',
    value: function _handlePing() {
      this.lastPing = now();
    }

    /*
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

    /*
    * Connect the socket to the server, and binds to native ws functions
    * @params {Object} params - Optional parameters
    * @params {String} params.location - Hostname to connect to, defaults to `window.location.hostname`
    * @params {String} parmas.port - Port to connect to, defaults to `window.location.port`
    * @params {String} params.protocol - Protocol to use, either 'wss' or 'ws'
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

    /*
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

    /*
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

    /*
    * Message handler for messages received
    * @param {MessageEvent} msg - Message received from ws
    */

  }, {
    key: 'handleMessage',
    value: function handleMessage(msg) {
      if (msg.data === "ping") return this._handlePing();

      parsed_msg = JSON.parse(msg.data);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNjg4OGQ0MmQ0YWVmMzkyNzY1ZWMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2Fzc2V0cy9qYXZhc2NyaXB0cy9tYWluLmpzIiwid2VicGFjazovLy8uL2xpYi9hbWJlci9hc3NldHMvanMvYW1iZXIuanMiXSwibmFtZXMiOlsiRVZFTlRTIiwiam9pbiIsImxlYXZlIiwibWVzc2FnZSIsIlNUQUxFX0NPTk5FQ1RJT05fVEhSRVNIT0xEX1NFQ09ORFMiLCJTT0NLRVRfUE9MTElOR19SQVRFIiwibm93IiwiRGF0ZSIsImdldFRpbWUiLCJzZWNvbmRzU2luY2UiLCJ0aW1lIiwiQ2hhbm5lbCIsInRvcGljIiwic29ja2V0Iiwib25NZXNzYWdlSGFuZGxlcnMiLCJ3cyIsInNlbmQiLCJKU09OIiwic3RyaW5naWZ5IiwiZXZlbnQiLCJtc2ciLCJmb3JFYWNoIiwiaGFuZGxlciIsInN1YmplY3QiLCJjYWxsYmFjayIsInBheWxvYWQiLCJwdXNoIiwiU29ja2V0IiwiZW5kcG9pbnQiLCJjaGFubmVscyIsImxhc3RQaW5nIiwicmVjb25uZWN0VHJpZXMiLCJhdHRlbXB0UmVjb25uZWN0IiwicmVjb25uZWN0VGltZW91dCIsInNldFRpbWVvdXQiLCJjb25uZWN0IiwicGFyYW1zIiwiX3JlY29ubmVjdCIsIl9yZWNvbm5lY3RJbnRlcnZhbCIsInBvbGxpbmdUaW1lb3V0IiwiX2Nvbm5lY3Rpb25Jc1N0YWxlIiwiX3BvbGwiLCJjbGVhclRpbWVvdXQiLCJfc3RhcnRQb2xsaW5nIiwib3B0cyIsImxvY2F0aW9uIiwid2luZG93IiwiaG9zdG5hbWUiLCJwb3J0IiwicHJvdG9jb2wiLCJPYmplY3QiLCJhc3NpZ24iLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIldlYlNvY2tldCIsIm9ubWVzc2FnZSIsImhhbmRsZU1lc3NhZ2UiLCJvbmNsb3NlIiwib25vcGVuIiwiX3Jlc2V0IiwiY2xvc2UiLCJjaGFubmVsIiwiZGF0YSIs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TztBQUNkLFVBQUlrRCxVQUFVLElBQUluRCxPQUFKLENBQVlDLEtBQVosRUFBbUIsSUFBbkIsQ0FBZDtBQUNBLFdBQUtpQixRQUFMLENBQWNILElBQWQsQ0FBbUJvQyxPQUFuQjtBQUNBLGFBQU9BLE9BQVA7QUFDRDs7QUFFRDs7Ozs7OztrQ0FJZTFDLEcsRUFBSztBQUNsQixVQUFJQSxJQUFJMkMsSUFBSixLQUFhLE1BQWpCLEVBQXlCLE9BQU8sS0FBS0MsV0FBTCxFQUFQOztBQUV6QkMsbUJBQWFoRCxLQUFLaUQsS0FBTCxDQUFXOUMsSUFBSTJDLElBQWYsQ0FBYjtBQUNBLFdBQUtsQyxRQUFMLENBQWNSLE9BQWQsQ0FBc0IsVUFBQ3lDLE9BQUQsRUFBYTtBQUNqQyxZQUFJQSxRQUFRbEQsS0FBUixLQUFrQnFELFdBQVdyRCxLQUFqQyxFQUF3Q2tELFFBQVFMLGFBQVIsQ0FBc0JRLFVBQXRCO0FBQ3pDLE9BRkQ7QUFHRDs7Ozs7O0FBR0hFLE9BQU9DLE9BQVAsR0FBaUI7QUFDZnpDLFVBQVFBO0FBRE8sQ0FBakIsQyIsImZpbGUiOiJtYWluLmJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9kaXN0XCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNjg4OGQ0MmQ0YWVmMzkyNzY1ZWMiLCJpbXBvcnQgQW1iZXIgZnJvbSAnYW1iZXInXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXNzZXRzL2phdmFzY3JpcHRzL21haW4uanMiLCJjb25zdCBFVkVOVFMgPSB7XG4gIGpvaW46ICdqb2luJyxcbiAgbGVhdmU6ICdsZWF2ZScsXG4gIG1lc3NhZ2U6ICdtZXNzYWdlJ1xufVxuY29uc3QgU1RBTEVfQ09OTkVDVElPTl9USFJFU0hPTERfU0VDT05EUyA9IDEwMFxuY29uc3QgU09DS0VUX1BPTExJTkdfUkFURSA9IDEwMDAwXG5cbi8qXG4qIFJldHVybnMgYSBudW1lcmljIHZhbHVlIGZvciB0aGUgY3VycmVudCB0aW1lXG4qL1xubGV0IG5vdyA9ICgpID0+IHtcbiAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpXG59XG5cbi8qXG4qIFJldHVybnMgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgY3VycmVudCB0aW1lIGFuZCBwYXNzZWQgYHRpbWVgIGluIHNlY29uZHNcbiogQHBhcmFtIHtOdW1iZXJ8RGF0ZX0gdGltZSAtIEEgbnVtZXJpYyB0aW1lIG9yIGRhdGUgb2JqZWN0XG4qL1xubGV0IHNlY29uZHNTaW5jZSA9ICh0aW1lKSA9PiB7XG4gIHJldHVybiAobm93KCkgLSB0aW1lKSAvIDEwMDBcbn1cblxuLypcbiogQ2xhc3MgZm9yIGNoYW5uZWwgcmVsYXRlZCBmdW5jdGlvbnMgKGpvaW5pbmcsIGxlYXZpbmcsIHN1YnNjcmliaW5nIGFuZCBzZW5kaW5nIG1lc3NhZ2VzKVxuKi9cbmV4cG9ydCBjbGFzcyBDaGFubmVsIHtcbiAgLypcbiAgKiBAcGFyYW0ge1N0cmluZ30gdG9waWMgLSB0b3BpYyB0byBzdWJzY3JpYmUgdG9cbiAgKiBAcGFyYW0ge1NvY2tldH0gc29ja2V0IC0gQSBTb2NrZXQgaW5zdGFuY2VcbiAgKi9cbiAgY29uc3RydWN0b3IgKHRvcGljLCBzb2NrZXQpIHtcbiAgICB0aGlzLnRvcGljID0gdG9waWNcbiAgICB0aGlzLnNvY2tldCA9IHNvY2tldFxuICAgIHRoaXMub25NZXNzYWdlSGFuZGxlcnMgPSBbXVxuICB9XG5cbiAgLypcbiAgKiBKb2luIGEgY2hhbm5lbCwgc3Vic2NyaWJlIHRvIGFsbCBjaGFubmVscyBtZXNzYWdlc1xuICAqL1xuICBqb2luICgpIHtcbiAgICB0aGlzLnNvY2tldC53cy5zZW5kKEpTT04uc3RyaW5naWZ5KHtldmVudDogRVZFTlRTLmpvaW4sIHRvcGljOiB0aGlzLnRvcGljfSkpXG4gIH1cblxuICAvKlxuICAqIExlYXZlIGEgY2hhbm5lbCwgc3RvcCBzdWJzY3JpYmluZyB0byBjaGFubmVsIG1lc3NhZ2VzXG4gICovXG4gIGxlYXZlICgpIHtcbiAgICB0aGlzLnNvY2tldC53cy5zZW5kKEpTT04uc3RyaW5naWZ5KHtldmVudDogRVZFTlRTLmxlYXZlLCB0b3BpYzogdGhpcy50b3BpY30pKVxuICB9XG5cbiAgLypcbiAgKiBDYWxscyBhbGwgbWVzc2FnZSBoYW5kbGVycyB3aXRoIGEgbWF0Y2hpbmcgc3ViamVjdFxuICAqL1xuICBoYW5kbGVNZXNzYWdlIChtc2cpIHtcbiAgICB0aGlzLm9uTWVzc2FnZUhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgIGlmIChoYW5kbGVyLnN1YmplY3QgPT09IG1zZy5zdWJqZWN0KSBoYW5kbGVyLmNhbGxiYWNrKG1zZy5wYXlsb2FkKVxuICAgIH0pXG4gIH1cblxuICAvKlxuICAqIFN1YnNjcmliZSB0byBhIGNoYW5uZWwgc3ViamVjdFxuICAqIEBwYXJhbXMge1N0cmluZ30gc3ViamVjdCAtIHN1YmplY3QgdG8gbGlzdGVuIGZvcjogYG1zZzpuZXdgXG4gICogQHBhcmFtcyAoZnVuY3Rpb24pIGNhbGxiYWNrIC0gY2FsbGJhY2sgZnVuY3Rpb24gd2hlbiBhIG5ldyBtZXNzYWdlIGFycml2ZXNcbiAgKi9cbiAgb24gKHN1YmplY3QsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5vbk1lc3NhZ2VIYW5kbGVycy5wdXNoKHtzdWJqZWN0OiBzdWJqZWN0LCBjYWxsYmFjazogY2FsbGJhY2t9KVxuICB9XG5cbiAgLypcbiAgKiBTZW5kIGEgbmV3IG1lc3NhZ2UgdG8gdGhlIGNoYW5uZWxcbiAgKiBAcGFyYW1zIHtTdHJpbmd9IHN1YmplY3QgLSBzdWJqZWN0IHRvIHNlbmQgbWVzc2FnZSB0bzogYG1zZzpuZXdgXG4gICogQHBhcmFtcyB7T2JqZWN0fSBwYXlsb2FkIC0gcGF5bG9hZCBvYmplY3Q6IGB7bWVzc2FnZTogJ2hlbGxvJ31gXG4gICovXG4gIHB1c2ggKHN1YmplY3QsIHBheWxvYWQpIHtcbiAgICB0aGlzLnNvY2tldC53cy5zZW5kKEpTT04uc3RyaW5naWZ5KHtldmVudDogRVZFTlRTLm1lc3NhZ2UsIHRvcGljOiB0aGlzLnRvcGljLCBzdWJqZWN0OiBzdWJqZWN0LCBwYXlsb2FkOiBwYXlsb2FkfSkpXG4gIH1cbn1cblxuLypcbiogQ2xhc3MgZm9yIG1haW50YWluaW5nIGNvbm5lY3Rpb24gd2l0aCBzZXJ2ZXIgYW5kIG1haW50YWluaW5nIGNoYW5uZWxzIGxpc3RcbiovXG5leHBvcnQgY2xhc3MgU29ja2V0IHtcbiAgLypcbiAgKiBAcGFyYW0ge1N0cmluZ30gZW5kcG9pbnQgLSBXZWJzb2NrZXQgZW5kcG9udCB1c2VkIGluIHJvdXRlcy5jciBmaWxlXG4gICovXG4gIGNvbnN0cnVjdG9yIChlbmRwb2ludCkge1xuICAgIHRoaXMuZW5kcG9pbnQgPSBlbmRwb2ludFxuICAgIHRoaXMud3MgPSBudWxsXG4gICAgdGhpcy5jaGFubmVscyA9IFtdXG4gICAgdGhpcy5sYXN0UGluZyA9IG5vdygpXG4gICAgdGhpcy5yZWNvbm5lY3RUcmllcyA9IDBcbiAgICB0aGlzLmF0dGVtcHRSZWNvbm5lY3QgPSB0cnVlXG4gIH1cblxuICAvKlxuICAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIGxhc3QgcmVjZWl2ZWQgcGluZyBoYXMgYmVlbiBwYXN0IHRoZSB0aHJlc2hvbGRcbiAgKi9cbiAgX2Nvbm5lY3Rpb25Jc1N0YWxlICgpIHtcbiAgICByZXR1cm4gc2Vjb25kc1NpbmNlKHRoaXMubGFzdFBpbmcpID4gU1RBTEVfQ09OTkVDVElPTl9USFJFU0hPTERfU0VDT05EU1xuICB9XG5cbiAgLypcbiAgKiBUcmllcyB0byByZWNvbm5lY3QgdG8gdGhlIHdlYnNvY2tldCBzZXJ2ZXIgdXNpbmcgYSByZWN1cnNpdmUgdGltZW91dFxuICAqL1xuICBfcmVjb25uZWN0ICgpIHtcbiAgICB0aGlzLnJlY29ubmVjdFRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMucmVjb25uZWN0VHJpZXMrK1xuICAgICAgdGhpcy5jb25uZWN0KHRoaXMucGFyYW1zKVxuICAgICAgdGhpcy5fcmVjb25uZWN0KClcbiAgICB9LCB0aGlzLl9yZWNvbm5lY3RJbnRlcnZhbCgpKVxuICB9XG5cbiAgLypcbiAgKiBSZXR1cm5zIGFuIGluY3JlbWVudGluZyB0aW1lb3V0IGludGVydmFsIGJhc2VkIGFyb3VuZCB0aGUgbnVtYmVyIG9mIHJlY29ubmVjdGlvbiByZXRyaWVzXG4gICovXG4gIF9yZWNvbm5lY3RJbnRlcnZhbCAoKSB7XG4gICAgcmV0dXJuIFsxMDAwLCAyMDAwLCA1MDAwLCAxMDAwMF1bdGhpcy5yZWNvbm5lY3RUcmllc10gfHwgMTAwMDBcbiAgfVxuXG4gIC8qXG4gICogU2V0cyBhIHJlY3Vyc2l2ZSB0aW1lb3V0IHRvIGNoZWNrIGlmIHRoZSBjb25uZWN0aW9uIGlzIHN0YWxlXG4gICovXG4gIF9wb2xsICgpIHtcbiAgICB0aGlzLnBvbGxpbmdUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fY29ubmVjdGlvbklzU3RhbGUoKSkge1xuICAgICAgICB0aGlzLl9yZWNvbm5lY3QoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcG9sbCgpXG4gICAgICB9XG4gICAgfSwgU09DS0VUX1BPTExJTkdfUkFURSlcbiAgfVxuXG4gIC8qXG4gICogQ2xlYXIgcG9sbGluZyB0aW1lb3V0IGFuZCBzdGFydCBwb2xsaW5nXG4gICovXG4gIF9zdGFydFBvbGxpbmcgKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLnBvbGxpbmdUaW1lb3V0KVxuICAgIHRoaXMuX3BvbGwoKVxuICB9XG5cbiAgLypcbiAgKiBTZXRzIGBsYXN0UGluZ2AgdG8gdGhlIGN1cmVudCB0aW1lXG4gICovXG4gIF9oYW5kbGVQaW5nICgpIHtcbiAgICB0aGlzLmxhc3RQaW5nID0gbm93KClcbiAgfVxuXG4gIC8qXG4gICogQ2xlYXJzIHJlY29ubmVjdCB0aW1lb3V0LCByZXNldHMgdmFyaWFibGVzIGFuIHN0YXJ0cyBwb2xsaW5nXG4gICovXG4gIF9yZXNldCAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMucmVjb25uZWN0VGltZW91dClcbiAgICB0aGlzLnJlY29ubmVjdFRyaWVzID0gMFxuICAgIHRoaXMuYXR0ZW1wdFJlY29ubmVjdCA9IHRydWVcbiAgICB0aGlzLl9zdGFydFBvbGxpbmcoKVxuICB9XG5cbiAgLypcbiAgKiBDb25uZWN0IHRoZSBzb2NrZXQgdG8gdGhlIHNlcnZlciwgYW5kIGJpbmRzIHRvIG5hdGl2ZSB3cyBmdW5jdGlvbnNcbiAgKiBAcGFyYW1zIHtPYmplY3R9IHBhcmFtcyAtIE9wdGlvbmFsIHBhcmFtZXRlcnNcbiAgKiBAcGFyYW1zIHtTdHJpbmd9IHBhcmFtcy5sb2NhdGlvbiAtIEhvc3RuYW1lIHRvIGNvbm5lY3QgdG8sIGRlZmF1bHRzIHRvIGB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWVgXG4gICogQHBhcmFtcyB7U3RyaW5nfSBwYXJtYXMucG9ydCAtIFBvcnQgdG8gY29ubmVjdCB0bywgZGVmYXVsdHMgdG8gYHdpbmRvdy5sb2NhdGlvbi5wb3J0YFxuICAqIEBwYXJhbXMge1N0cmluZ30gcGFyYW1zLnByb3RvY29sIC0gUHJvdG9jb2wgdG8gdXNlLCBlaXRoZXIgJ3dzcycgb3IgJ3dzJ1xuICAqL1xuICBjb25uZWN0IChwYXJhbXMpIHtcbiAgICB0aGlzLnBhcmFtcyA9IHBhcmFtc1xuXG4gICAgbGV0IG9wdHMgPSB7XG4gICAgICBsb2NhdGlvbjogd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLFxuICAgICAgcG9ydDogd2luZG93LmxvY2F0aW9uLnBvcnQsXG4gICAgICBwcm90b2NvbDogd2luZG93LmxvY2F0aW9uLnByb3RvY29sID09PSAnaHR0cHM6JyA/ICd3c3M6JyA6ICd3czonLFxuICAgIH1cblxuICAgIGlmIChwYXJhbXMpIE9iamVjdC5hc3NpZ24ob3B0cywgcGFyYW1zKVxuICAgIGlmIChvcHRzLnBvcnQpIG9wdHMubG9jYXRpb24gKz0gYDoke29wdHMucG9ydH1gXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4geyAgICAgIFxuICAgICAgdGhpcy53cyA9IG5ldyBXZWJTb2NrZXQoYCR7b3B0cy5wcm90b2NvbH0vLyR7b3B0cy5sb2NhdGlvbn0ke3RoaXMuZW5kcG9pbnR9YClcbiAgICAgIHRoaXMud3Mub25tZXNzYWdlID0gKG1zZykgPT4geyB0aGlzLmhhbmRsZU1lc3NhZ2UobXNnKSB9XG4gICAgICB0aGlzLndzLm9uY2xvc2UgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmF0dGVtcHRSZWNvbm5lY3QpIHRoaXMuX3JlY29ubmVjdCgpXG4gICAgICB9XG4gICAgICB0aGlzLndzLm9ub3BlbiA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLypcbiAgKiBDbG9zZXMgdGhlIHNvY2tldCBjb25uZWN0aW9uIHBlcm1hbmVudGx5XG4gICovXG4gIGRpc2Nvbm5lY3QgKCkge1xuICAgIHRoaXMuYXR0ZW1wdFJlY29ubmVjdCA9IGZhbHNlXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMucG9sbGluZ1RpbWVvdXQpXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMucmVjb25uZWN0VGltZW91dClcbiAgICB0aGlzLndzLmNsb3NlKClcbiAgfVxuXG4gIC8qXG4gICogQWRkcyBhIG5ldyBjaGFubmVsIHRvIHRoZSBzb2NrZXQgY2hhbm5lbHMgbGlzdFxuICAqIEBwYXJhbSB7U3RyaW5nfSB0b3BpYyAtIFRvcGljIGZvciB0aGUgY2hhbm5lbDogYGNoYXRfcm9vbToxMjNgXG4gICovXG4gIGNoYW5uZWwgKHRvcGljKSB7XG4gICAgbGV0IGNoYW5uZWwgPSBuZXcgQ2hhbm5lbCh0b3BpYywgdGhpcylcbiAgICB0aGlzLmNoYW5uZWxzLnB1c2goY2hhbm5lbClcbiAgICByZXR1cm4gY2hhbm5lbFxuICB9XG5cbiAgLypcbiAgKiBNZXNzYWdlIGhhbmRsZXIgZm9yIG1lc3NhZ2VzIHJlY2VpdmVkXG4gICogQHBhcmFtIHtNZXNzYWdlRXZlbnR9IG1zZyAtIE1lc3NhZ2UgcmVjZWl2ZWQgZnJvbSB3c1xuICAqL1xuICBoYW5kbGVNZXNzYWdlIChtc2cpIHtcbiAgICBpZiAobXNnLmRhdGEgPT09IFwicGluZ1wiKSByZXR1cm4gdGhpcy5faGFuZGxlUGluZygpXG5cbiAgICBwYXJzZWRfbXNnID0gSlNPTi5wYXJzZShtc2cuZGF0YSlcbiAgICB0aGlzLmNoYW5uZWxzLmZvckVhY2goKGNoYW5uZWwpID0+IHtcbiAgICAgIGlmIChjaGFubmVsLnRvcGljID09PSBwYXJzZWRfbXNnLnRvcGljKSBjaGFubmVsLmhhbmRsZU1lc3NhZ2UocGFyc2VkX21zZylcbiAgICB9KVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBTb2NrZXQ6IFNvY2tldFxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbGliL2FtYmVyL2Fzc2V0cy9qcy9hbWJlci5qcyJdLCJzb3VyY2VSb290IjoiIn0=