#!/usr/bin/env node
'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _Set = require('babel-runtime/core-js/set')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var Q = require('q');
var url = require('url');
var fs = require('fs');
var request = require('superagent');
var path = require('path');

var isRunningAsScript = module.parent ? false : true;
function log(message) {
    if (!isRunningAsScript) {
        return;
    }
    if (Object.prototype.toString.apply(message) == '[object Error]') {
        console.error('[ERROR] ' + message.message);
        console.error(message.stack);
        return;
    }
    console.log('[INFO] ' + message);
}

var GFW_LIST_URL = 'https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt';

function decodeAutoproxyContent(inputStr) {
    return new Buffer(inputStr, 'base64').toString();
}

function getHostname(str) {
    if (str.indexOf('http:') != 0) {
        str = 'http://' + str;
    }
    return url.parse(str).hostname;
}

function addDomainToSet(set, str) {
    var domain = getHostname(str);
    if (domain) {
        set.add(domain);
    }
}

function getAutoProxyFile(localPath) {
    return _regeneratorRuntime.async(function getAutoProxyFile$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.t0 = localPath;

                if (!context$1$0.t0) {
                    context$1$0.next = 5;
                    break;
                }

                context$1$0.next = 4;
                return _regeneratorRuntime.awrap(fs.exists(localPath));

            case 4:
                context$1$0.t0 = !context$1$0.sent;

            case 5:
                if (!context$1$0.t0) {
                    context$1$0.next = 9;
                    break;
                }

                context$1$0.next = 8;
                return _regeneratorRuntime.awrap(_Promise.reject(new Error('File at localPath not exist')));

            case 8:
                return context$1$0.abrupt('return', context$1$0.sent);

            case 9:
                if (!localPath) {
                    context$1$0.next = 14;
                    break;
                }

                log('getting file from: ' + localPath);
                context$1$0.next = 13;
                return _regeneratorRuntime.awrap(Q.nfcall(fs.readFile, localPath, 'utf-8'));

            case 13:
                return context$1$0.abrupt('return', context$1$0.sent);

            case 14:

                log('getting file from: ' + GFW_LIST_URL);
                context$1$0.next = 17;
                return _regeneratorRuntime.awrap(new _Promise(function (resolve, reject) {
                    request.get(GFW_LIST_URL).end(function (err, resp) {
                        if (err) {
                            return reject(err);
                        }

                        return resolve(resp.text);
                    });
                }));

            case 17:
                return context$1$0.abrupt('return', context$1$0.sent);

            case 18:
            case 'end':
                return context$1$0.stop();
        }
    }, null, this);
}

function getRuleList(localPath) {
    var content;
    return _regeneratorRuntime.async(function getRuleList$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return _regeneratorRuntime.awrap(getAutoProxyFile(localPath));

            case 2:
                content = context$1$0.sent;

                content = decodeAutoproxyContent(content);
                return context$1$0.abrupt('return', content.split('\n'));

            case 5:
            case 'end':
                return context$1$0.stop();
        }
    }, null, this);
}

function parseAutoProxyFile(ruleList) {
    var domains = new _Set();
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = _getIterator(ruleList), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var line = _step.value;

            if (line.indexOf('.*') >= 0) {
                continue;
            } else if (line.indexOf('*') >= 0) {
                line = line.replace('*', '/');
            }
            if (line.indexOf('||') == 0) {
                line = line.replace('||', '');
            } else if (line.indexOf('|') == 0) {
                line = line.replace('|', '');
            } else if (line.indexOf('.') == 0) {
                line = line.replace('.', '');
            }
            if (line.indexOf('!') == 0) {
                continue;
            } else if (line.indexOf('[') == 0) {
                continue;
            } else if (line.indexOf('@') == 0) {
                // ignore white list
                continue;
            }
            addDomainToSet(domains, line);
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
                _iterator['return']();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return domains;
}

function reduceDomains(domains) {
    var tldContent, tlds, newDomains, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, domain, domainParts, lastRootDomain, i, rootDomain, uniDomains, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3;

    return _regeneratorRuntime.async(function reduceDomains$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return _regeneratorRuntime.awrap(Q.nfcall(fs.readFile, path.join(__dirname, '../resources/tld.txt'), 'utf-8'));

            case 2:
                tldContent = context$1$0.sent;
                tlds = new _Set(tldContent.split('\n'));
                newDomains = new _Set();
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                context$1$0.prev = 8;
                _iterator2 = _getIterator(domains);

            case 10:
                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                    context$1$0.next = 33;
                    break;
                }

                domain = _step2.value;
                domainParts = domain.split('.');
                lastRootDomain = null;
                i = 0;

            case 15:
                if (!(i < domainParts.length)) {
                    context$1$0.next = 29;
                    break;
                }

                rootDomain = domainParts.slice(domainParts.length - i - 1).join('.');

                if (!(i == 0)) {
                    context$1$0.next = 20;
                    break;
                }

                if (tlds.has(rootDomain)) {
                    context$1$0.next = 20;
                    break;
                }

                return context$1$0.abrupt('break', 29);

            case 20:
                lastRootDomain = rootDomain;

                if (!tlds.has(rootDomain)) {
                    context$1$0.next = 25;
                    break;
                }

                return context$1$0.abrupt('continue', 26);

            case 25:
                return context$1$0.abrupt('break', 29);

            case 26:
                i++;
                context$1$0.next = 15;
                break;

            case 29:
                if (lastRootDomain != null) {
                    newDomains.add(lastRootDomain);
                }

            case 30:
                _iteratorNormalCompletion2 = true;
                context$1$0.next = 10;
                break;

            case 33:
                context$1$0.next = 39;
                break;

            case 35:
                context$1$0.prev = 35;
                context$1$0.t0 = context$1$0['catch'](8);
                _didIteratorError2 = true;
                _iteratorError2 = context$1$0.t0;

            case 39:
                context$1$0.prev = 39;
                context$1$0.prev = 40;

                if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                    _iterator2['return']();
                }

            case 42:
                context$1$0.prev = 42;

                if (!_didIteratorError2) {
                    context$1$0.next = 45;
                    break;
                }

                throw _iteratorError2;

            case 45:
                return context$1$0.finish(42);

            case 46:
                return context$1$0.finish(39);

            case 47:
                uniDomains = new _Set();
                _iteratorNormalCompletion3 = true;
                _didIteratorError3 = false;
                _iteratorError3 = undefined;
                context$1$0.prev = 51;
                _iterator3 = _getIterator(newDomains);

            case 53:
                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                    context$1$0.next = 70;
                    break;
                }

                domain = _step3.value;
                domainParts = domain.split('.');
                i = 0;

            case 57:
                if (!(i < domainParts.length - 1)) {
                    context$1$0.next = 67;
                    break;
                }

                rootDomain = domainParts.slice(domainParts.length - i - 1).join('.');

                if (!domains.has(rootDomain)) {
                    context$1$0.next = 63;
                    break;
                }

                return context$1$0.abrupt('break', 67);

            case 63:
                uniDomains.add(domain);

            case 64:
                i++;
                context$1$0.next = 57;
                break;

            case 67:
                _iteratorNormalCompletion3 = true;
                context$1$0.next = 53;
                break;

            case 70:
                context$1$0.next = 76;
                break;

            case 72:
                context$1$0.prev = 72;
                context$1$0.t1 = context$1$0['catch'](51);
                _didIteratorError3 = true;
                _iteratorError3 = context$1$0.t1;

            case 76:
                context$1$0.prev = 76;
                context$1$0.prev = 77;

                if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                    _iterator3['return']();
                }

            case 79:
                context$1$0.prev = 79;

                if (!_didIteratorError3) {
                    context$1$0.next = 82;
                    break;
                }

                throw _iteratorError3;

            case 82:
                return context$1$0.finish(79);

            case 83:
                return context$1$0.finish(76);

            case 84:
                return context$1$0.abrupt('return', uniDomains);

            case 85:
            case 'end':
                return context$1$0.stop();
        }
    }, null, this, [[8, 35, 39, 47], [40,, 42, 46], [51, 72, 76, 84], [77,, 79, 83]]);
}

function generateFastPac(domains, proxy) {
    var pacTemplate, domainDict, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, domain, pac;

    return _regeneratorRuntime.async(function generateFastPac$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return _regeneratorRuntime.awrap(Q.nfcall(fs.readFile, path.join(__dirname, '../resources/proxy.pac'), 'utf-8'));

            case 2:
                pacTemplate = context$1$0.sent;
                domainDict = {};
                _iteratorNormalCompletion4 = true;
                _didIteratorError4 = false;
                _iteratorError4 = undefined;
                context$1$0.prev = 7;

                for (_iterator4 = _getIterator(domains); !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    domain = _step4.value;

                    domainDict[domain] = 1;
                }
                context$1$0.next = 15;
                break;

            case 11:
                context$1$0.prev = 11;
                context$1$0.t0 = context$1$0['catch'](7);
                _didIteratorError4 = true;
                _iteratorError4 = context$1$0.t0;

            case 15:
                context$1$0.prev = 15;
                context$1$0.prev = 16;

                if (!_iteratorNormalCompletion4 && _iterator4['return']) {
                    _iterator4['return']();
                }

            case 18:
                context$1$0.prev = 18;

                if (!_didIteratorError4) {
                    context$1$0.next = 21;
                    break;
                }

                throw _iteratorError4;

            case 21:
                return context$1$0.finish(18);

            case 22:
                return context$1$0.finish(15);

            case 23:
                pac = pacTemplate.replace(/__PROXY__/, JSON.stringify(proxy)).replace('__DOMAINS__', JSON.stringify(domainDict, null, 2));
                return context$1$0.abrupt('return', pac);

            case 25:
            case 'end':
                return context$1$0.stop();
        }
    }, null, this, [[7, 11, 15, 23], [16,, 18, 22]]);
}

function generatePrecisePac(ruleList, proxy) {
    var pacTemplate, pac;
    return _regeneratorRuntime.async(function generatePrecisePac$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                ruleList = ruleList.filter(function (val, index) {
                    if (!val) {
                        return false;
                    }
                    if (val.indexOf('!') == 0) {
                        return false;
                    }
                    if (val.indexOf('[') == 0) {
                        return false;
                    }
                    return true;
                });
                context$1$0.next = 3;
                return _regeneratorRuntime.awrap(Q.nfcall(fs.readFile, path.join(__dirname, '../resources/abp.js'), 'utf-8'));

            case 3:
                pacTemplate = context$1$0.sent;
                pac = pacTemplate.replace(/__PROXY__/, JSON.stringify(proxy)).replace('__RULES__', JSON.stringify(ruleList, null, 2));
                return context$1$0.abrupt('return', pac);

            case 6:
            case 'end':
                return context$1$0.stop();
        }
    }, null, this);
}

// running as script
if (!module.parent) {
    (function () {

        var program = require('commander');
        var packageInfo = require('../package.json');

        (function callee$1$0() {
            var input, output, proxy, precise, pac, ruleList, domains;
            return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        context$2$0.prev = 0;

                        program.version(packageInfo.version).option('-i, --input [path]', 'file path to the autoproxy file, an online download of g-f-w-list will happend if not given').option('-o, --output [path]', 'file path to the generated pac, ./proxy.pac will be written is not given').option('-p, --proxy <proxy>', 'proxy, required, for example: SOCKS 127.0.0.1:8080').option('--precise', 'if generating a precise proxy pac according to Ad Block Plus implementation').parse(process.argv);

                        input = program.input;
                        output = program.output || './proxy.pac';
                        proxy = program.proxy;

                        if (proxy) {
                            context$2$0.next = 7;
                            break;
                        }

                        throw new Error('Proxy is required!');

                    case 7:
                        precise = program.precise;
                        pac = null;
                        context$2$0.next = 11;
                        return _regeneratorRuntime.awrap(getRuleList(input));

                    case 11:
                        ruleList = context$2$0.sent;

                        if (!precise) {
                            context$2$0.next = 18;
                            break;
                        }

                        context$2$0.next = 15;
                        return _regeneratorRuntime.awrap(generatePrecisePac(ruleList, proxy));

                    case 15:
                        pac = context$2$0.sent;
                        context$2$0.next = 25;
                        break;

                    case 18:
                        domains = parseAutoProxyFile(ruleList);
                        context$2$0.next = 21;
                        return _regeneratorRuntime.awrap(reduceDomains(domains));

                    case 21:
                        domains = context$2$0.sent;
                        context$2$0.next = 24;
                        return _regeneratorRuntime.awrap(generateFastPac(domains, proxy));

                    case 24:
                        pac = context$2$0.sent;

                    case 25:
                        context$2$0.next = 27;
                        return _regeneratorRuntime.awrap(Q.nfcall(fs.writeFile, output, pac));

                    case 27:
                        log('pac has been written to: ' + output);
                        context$2$0.next = 33;
                        break;

                    case 30:
                        context$2$0.prev = 30;
                        context$2$0.t0 = context$2$0['catch'](0);

                        log(context$2$0.t0);

                    case 33:
                    case 'end':
                        return context$2$0.stop();
                }
            }, null, this, [[0, 30]]);
        })();

        // running as module
    })();
} else {

        module.exports = {
            getRuleList: getRuleList,
            parseAutoProxyFile: parseAutoProxyFile,
            reduceDomains: reduceDomains,
            generateFastPac: generateFastPac,
            generatePrecisePac: generateFastPac
        };
    }