'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

function hello() {
    return _regeneratorRuntime.async(function hello$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return _regeneratorRuntime.awrap(_Promise.resolve('Hello '));

            case 2:
                return context$1$0.abrupt('return', context$1$0.sent);

            case 3:
            case 'end':
                return context$1$0.stop();
        }
    }, null, this);
};

(function world() {
    var h;
    return _regeneratorRuntime.async(function world$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return _regeneratorRuntime.awrap(hello());

            case 2:
                h = context$1$0.sent;

                console.log(h);

            case 4:
            case 'end':
                return context$1$0.stop();
        }
    }, null, this);
})();