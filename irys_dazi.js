// irys_dazi.js - 完整 Node.js 版本
// 依赖: axios, js-yaml, crypto, fs
// 安装: npm install axios js-yaml

const fs = require('fs');
const yaml = require('js-yaml');
const axios = require('axios');
const crypto = require('crypto');

// ========== 配置读取 ==========
const config = Object.assign({
    proxy_mode: 'static',
    nstproxy_channel: '',
    nstproxy_password: '',
    script_run_count: 5,
    run_mode: 1
}, fs.existsSync('config.yaml') ? yaml.load(fs.readFileSync('config.yaml', 'utf8')) : {});

// ========== 账号与代理加载 ==========
const addresses = fs.readFileSync('Address.txt', 'utf8').split('\n').map(x => x.trim()).filter(Boolean);
let proxies = [];
if (config.proxy_mode === 'static') {
    proxies = fs.existsSync('Proxy.txt') ? fs.readFileSync('Proxy.txt', 'utf8').split('\n').map(x => x.trim()).filter(Boolean) : [];
}

// ========== 日志输出 ==========
function showMsg(msg, level = 0) {
    const prefix = level === 1 ? '✔' : level === 2 ? '⚠' : level === 3 ? '❌' : '';
    const out = `${prefix ? prefix + ' ' : ''}${msg}`;
    console.log(out);
    fs.appendFileSync('Log.txt', `${new Date().toISOString()} - ${msg}\n`);
}

// ========== antiCheatHash 算法 ==========
function computeAntiCheatHash(e, t, a, r, s, i) {
    const l = s + i;
    let n = 0 + 23 * t + 89 * a + 41 * r + 67 * s + 13 * i + 97 * l;
    let o = 0;
    for (let idx = 0; idx < e.length; idx++) {
        o += e.charCodeAt(idx) * (idx + 1);
    }
    n += 31 * o;
    const c = Math.floor(0x178ba57548d * n % 9007199254740991);
    const result = `${e.toLowerCase()}_${t}_${a}_${r}_${s}_${i}_${c}`;
    return crypto.createHash('sha256').update(result).digest('hex').substring(0, 32);
}

// ========== Spritetype 提交 ==========
async function spritetype(account, proxy, script_run_count, run_mode) {
    let fail_time = 0;
    let next_execution_time = 0;
    for (let i = 0; i < script_run_count;) {
        if (Date.now() < next_execution_time) {
            await new Promise(r => setTimeout(r, 1000));
            continue;
        }
        // 生成参数
        const wpm = Math.floor(Math.random() * 21) + 65;
        const time = 15;
        const totalChars = Math.floor(wpm * 5 * time / 60);
        const incorrectChars = Math.floor(Math.random() * Math.max(1, totalChars / 15));
        const correctChars = totalChars - incorrectChars;
        const accuracy = totalChars === 0 ? 100 : Math.round(100.0 * correctChars / totalChars);
        let progressData = [];
        for (let j = 0; j < time; j++) {
            let baseVal = correctChars * (j + 1) / time;
            let jitter = Math.floor(Math.random() * 3) - 1;
            let val = Math.round(baseVal) + jitter;
            if (j > 0 && val < progressData[j - 1]) val = progressData[j - 1];
            if (val > correctChars) val = correctChars;
            if (val < 0) val = 0;
            progressData.push(val);
        }
        const antiCheatHash = computeAntiCheatHash(account, wpm, accuracy, time, correctChars, incorrectChars);
        const payload = {
            walletAddress: account,
            gameStats: {
                wpm, accuracy, time, correctChars, incorrectChars, progressData
            },
            antiCheatHash,
            timestamp: Date.now()
        };
        showMsg(`address=${account}, wpm=${wpm}, accuracy=${accuracy}, time=${time}, correctChars=${correctChars}, incorrectChars=${incorrectChars}, antiCheatHash=${antiCheatHash}`);
        try {
            const res = await axios.post('https://spritetype.irys.xyz/api/submit-result', payload, {
                headers: {
                    'accept': '*/*',
                    'content-type': 'application/json',
                    'referer': 'https://spritetype.irys.xyz/'
                }
                // 代理支持可加 httpsAgent
            });
            if (res.data && res.data.success) {
                showMsg(`第${i + 1}次-成绩提交: ${res.data.message}`, 1);
                i++;
                fail_time = 0;
                if (run_mode === 2) {
                    await new Promise(r => setTimeout(r, 1000));
                } else {
                    showMsg('35秒后进行下一轮', 1);
                    await new Promise(r => setTimeout(r, 35000));
                }
                next_execution_time = 0;
            } else {
                showMsg(`第${i + 1}次-成绩提交: ${JSON.stringify(res.data)}`, 2);
            }
        } catch (err) {
            const errMsg = err.response ? JSON.stringify(err.response.data) : err.message;
            showMsg(`异常信息: ${errMsg}`, 2);
            if (errMsg.includes('Please wait')) {
                const match = errMsg.match(/Please wait (\d+) seconds/);
                let waitSeconds = 30;
                if (match) waitSeconds = parseInt(match[1]);
                showMsg(`接口已限制，等待${waitSeconds}秒后重试...`, 2);
                await new Promise(r => setTimeout(r, waitSeconds * 1000));
                continue;
            }
            fail_time++;
            if (fail_time < 15) {
                next_execution_time = Date.now() + 10000;
            } else {
                showMsg('失败次数过多，跳过该账号', 3);
                break;
            }
        }
    }
}

// ========== 代理分配 ==========
function getProxy(idx) {
    if (config.proxy_mode === 'dynamic') {
        const channel = config.nstproxy_channel;
        const password = config.nstproxy_password;
        const session = Math.random().toString(36).slice(2, 12);
        const appId = '824724622021E04F';
        return `http://${channel}-residential-country_ANY-r_30m-s_${session}-appid_${appId}:${password}@gate.nstproxy.io:24125`;
    } else if (proxies[idx]) {
        return proxies[idx];
    }
    return null;
}

// ========== 主循环 ==========
async function main() {
    await Promise.all(addresses.map(async (account, idx) => {
        const proxy = getProxy(idx);
        showMsg(`当前执行账号: ${idx + 1} - ${account}`);
        await spritetype(account, proxy, config.script_run_count, config.run_mode);
    }));
}

main(); 