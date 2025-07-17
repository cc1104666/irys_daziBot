# irys_dazi.js 使用说明

## 脚本简介

`irys_dazi.js` 是一个基于 Node.js 的自动化 Spritetype 刷榜脚本，支持多账号、动态/静态代理、自动参数生成、日志记录等功能。适合批量自动提交成绩，模拟真实用户行为。

---

## 功能特性
- 支持多账号自动提交 Spritetype 成绩
- 支持动态代理（NSTProxy）和静态代理（Proxy.txt）
- 自动生成打字进度、速度、准确率等参数，模拟真实用户
- 日志输出到 Log.txt，便于追踪
- 全异步并发执行，速度快、资源占用低
- 配置灵活，所有参数均可在 config.yaml 配置

---

## 依赖安装

请确保已安装 [Node.js](https://nodejs.org/)。

在脚本目录下执行：
```bash
npm install axios js-yaml
```

---

## 文件说明

- `irys_dazi.js`      —— 主脚本
- `config.yaml`       —— 配置文件（参数、代理模式等）
- `Address.txt`       —— 账号地址列表（每行一个地址）
- `Proxy.txt`         —— 静态代理列表（每行一个代理，静态代理模式下使用）
- `Log.txt`           —— 日志输出文件

---

## 配置说明（config.yaml 示例）

```yaml
# 代理模式: 'static' 静态代理（Proxy.txt），'dynamic' 动态代理（NSTProxy）
proxy_mode: dynamic
# 动态代理通道ID（仅proxy_mode为dynamic时需要）
nstproxy_channel: '你的NSTProxy通道ID'
# 动态代理密码（仅proxy_mode为dynamic时需要）
nstproxy_password: '你的NSTProxy密码'
# 每个账号执行多少次脚本
script_run_count: 5
# 运行模式（1=安全模式，2=极速模式）
run_mode: 1
```
## 使用动态代理
先去注册https://app.nstproxy.com/register?i=EE0Ije
充值时填写我的优惠卷码可优惠10% ：ANNITOBTC
---

## 运行方法

1. 配置好 `config.yaml`、`Address.txt`、`Proxy.txt`（如用静态代理）
2. 安装依赖：
   ```bash
   npm install axios js-yaml
   ```
3. 运行脚本：
   ```bash
   node irys_dazi.js
   ```

---

## 常见问题

- **Q: 如何切换代理模式？**
  - A: 修改 `config.yaml` 的 `proxy_mode` 字段为 `static` 或 `dynamic`。
- **Q: 代理怎么填写？**
  - A: 静态代理写在 `Proxy.txt`，每行一个，格式如 `ip:port` 或 `http://user:pass@ip:port`。
- **Q: 日志在哪里看？**
  - A: 所有日志会输出到 `Log.txt`，也会在终端显示。
- **Q: 支持多少账号？**
  - A: 理论上支持上百账号，Node.js 异步并发，资源占用极低。
- **Q: 失败重试机制？**
  - A: 每账号失败15次后自动跳过。

---

## 注意事项
- 请勿用于非法用途，风险自负。
- 代理质量、账号有效性会影响成功率。
- 若遇到反作弊升级导致失败，请抓包分析或联系开发者协助。

---

## 联系与支持
如需定制开发、遇到特殊问题，欢迎联系脚本作者。 