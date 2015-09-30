let Q = require('q');
let url = require('url');
let fs = require('fs');
let request = require('superagent');
let path = require('path');

let isRunningAsScript = module.parent ? false : true;
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

const GFW_LIST_URL = 'https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt';

function decodeAutoproxyContent(inputStr) {
    return (new Buffer(inputStr, 'base64')).toString();
}

function getHostname(str) {
    if (str.indexOf('http:') != 0) {
        str = 'http://' + str;
    }
    return url.parse(str).hostname;
}

function addDomainToSet(set, str) {
    let domain = getHostname(str);
    if (domain) {
        set.add(domain);
    }
}

async function getAutoProxyFile(localPath) {
    if (localPath && !(await fs.exists(localPath))) {
        return await Promise.reject(new Error('File at localPath not exist'));
    }

    if (localPath) {
        log('getting file from: ' + localPath);
        return await Q.nfcall(fs.readFile, localPath, 'utf-8');
    }

    log('getting file from: ' + GFW_LIST_URL);
    return await new Promise(function(resolve, reject) {
        request.get(GFW_LIST_URL).end(function(err, resp) {
            if (err) {
                return reject(err);
            }

            return resolve(resp.text);
        });
    });
}

async function getRuleList(localPath) {
    let content = await getAutoProxyFile(localPath);
    content = decodeAutoproxyContent(content);
    return content.split('\n');
}

function parseAutoProxyFile(ruleList) {
    let domains = new Set();
    for (let line of ruleList) {
        if (line.indexOf('.*') >= 0) {
            continue
        } else if (line.indexOf('*') >= 0) {
            line = line.replace('*', '/')
        }
        if (line.indexOf('||') == 0) {
            line = line.replace('||', '')
        } else if (line.indexOf('|') == 0) {
            line = line.replace('|', '')
        } else if (line.indexOf('.') == 0) {
            line = line.replace('.', '')
        }
        if (line.indexOf('!') == 0) {
            continue
        } else if (line.indexOf('[') == 0) {
            continue
        } else if (line.indexOf('@') == 0) {
            // ignore white list
            continue
        }
        addDomainToSet(domains, line);
    }
    return domains;
}

async function reduceDomains(domains) {
    let tldContent = await Q.nfcall(fs.readFile, path.join(__dirname, '../resources/tld.txt'), 'utf-8');
    let tlds = new Set(tldContent.split('\n'));
    let newDomains = new Set();
    for (let domain of domains) {
        let domainParts = domain.split('.');
        let lastRootDomain = null;
        for (let i = 0; i < domainParts.length; i++) {
            let rootDomain = domainParts.slice(domainParts.length - i - 1).join('.');
            if (i == 0) {
                if (!tlds.has(rootDomain)) {
                    break;
                }
            }
            lastRootDomain = rootDomain;
            if (tlds.has(rootDomain)) {
                continue;
            } else {
                break;
            }
        }
        if (lastRootDomain != null) {
            newDomains.add(lastRootDomain);
        }
    }
    let uniDomains = new Set();
    for (let domain of newDomains) {
        let domainParts = domain.split('.');
        for (let i = 0; i < domainParts.length - 1; i++) {
            let rootDomain = domainParts.slice(domainParts.length - i - 1).join('.');
            if (domains.has(rootDomain)) {
                break;
            } else {
                uniDomains.add(domain);
            }
        }
    }
    return uniDomains;
}

async function generateFastPac(domains, proxy) {
    let pacTemplate = await Q.nfcall(fs.readFile, path.join(__dirname, '../resources/proxy.pac'), 'utf-8');
    let domainDict = {};
    for (let domain of domains) {
        domainDict[domain] = 1;
    }
    let pac = pacTemplate.replace(/__PROXY__/, JSON.stringify(proxy)).replace('__DOMAINS__', JSON.stringify(domainDict, null, 2));
    return pac;
}

async function generatePrecisePac(ruleList, proxy) {
    ruleList = ruleList.filter(function(val, index) {
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
    let pacTemplate = await Q.nfcall(fs.readFile, path.join(__dirname, '../resources/abp.js'), 'utf-8');
    let pac = pacTemplate.replace(/__PROXY__/, JSON.stringify(proxy)).replace('__RULES__', JSON.stringify(ruleList, null, 2));
    return pac;
}

// running as script
if (!module.parent) {

    let program = require('commander');
    let packageInfo = require('../package.json');

    (async function() {
        try {
            program
                .version(packageInfo.version)
                .option('-i, --input [path]', 'file path to the autoproxy file, an online download of g-f-w-list will happend if not given')
                .option('-o, --output [path]', 'file path to the generated pac, ./proxy.pac will be written is not given')
                .option('-p, --proxy <proxy>', 'proxy, required, for example: SOCKS 127.0.0.1:8080')
                .option('--precise', 'if generating a precise proxy pac according to Ad Block Plus implementation')
                .parse(process.argv);

            let input = program.input;
            let output = program.output || './proxy.pac';
            let proxy = program.proxy;
            if (!proxy) {
                throw new Error('Proxy is required!');
            }
            let precise = program.precise;

            let pac = null;
            let ruleList = await getRuleList(input);
            if (precise) {
                pac = await generatePrecisePac(ruleList, proxy);
            } else {
                let domains = parseAutoProxyFile(ruleList);
                domains = await reduceDomains(domains);
                pac = await generateFastPac(domains, proxy);
            }
            await Q.nfcall(fs.writeFile, output, pac);
            log('pac has been written to: ' + output);
        } catch(e) {
            log(e);
        }
    })();

// running as module
} else {

    module.exports = {
        getRuleList: getRuleList,
        parseAutoProxyFile: parseAutoProxyFile,
        reduceDomains: reduceDomains,
        generateFastPac: generateFastPac,
        generatePrecisePac: generateFastPac
    }
}