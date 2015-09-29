let Q = require('q');
let url = require('url');
let fs = require('fs');
let request = require('superagent');

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
        return await Q.nfcall(fs.readFile, localPath, 'utf-8');
    }

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
    var tldContent = Q.nfcall(fs.readFile, './')
}