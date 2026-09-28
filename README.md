# 工作事项看板

一个本地工作事项管理工具：优先级、预计工作量、截止日、外部协助、长任务步骤拆分。

## 启动（带文件持久化）

双击 `启动看板.command`，或在终端里：

```
cd ~/Documents/claudecode/missionmanagement
node server.js
```

然后浏览器打开 <http://localhost:8787>。

- 任务数据会自动保存到同目录的 `tasks.json` 文件里。**清浏览器缓存、换浏览器、重装系统都不丢**（只要这个文件还在）。
- 关闭服务：回到终端按 `Ctrl+C`。

## 两种打开方式

| 方式 | 数据存哪 | 说明 |
|------|---------|------|
| `node server.js` 后访问 localhost | `tasks.json` 文件 | ✅ 推荐，持久化 |
| 直接双击 `work-board.html` | 浏览器 localStorage | 临时用，数据只在浏览器里 |

## 从旧数据迁移（一次性）

如果之前是直接双击 html 用的，数据在浏览器 localStorage 里，本地服务读不到，需要搬一次：

1. 双击打开 `work-board.html`（旧方式），点右上角「导出」，复制 JSON。
2. 用 `node server.js` 启动服务，浏览器打开 `http://localhost:8787`。
3. 点右上角「导入」，粘贴刚复制的 JSON，确认。

之后所有改动都会自动落到 `tasks.json`，不用再手动导出了。

## 备份

`tasks.json` 就是你的全部数据。放到 iCloud / git / 移动硬盘里即可备份；如果「桌面与文稿」同步开着，它会自动同步到你其他设备。

## 数据文件与 GitHub 上传

`tasks.json` 和 `dayitems.json` 是你的个人数据（含隐私），已加入 `.gitignore`，**不会**上传到 GitHub。

仓库中提供的两个空模板文件仅用于说明数据结构：

- `tasks.example.json` —— 空任务列表模板
- `dayitems.example.json` —— 空当日事项模板

别人 clone 下来后，直接 `node server.js` 启动即可：文件不存在时程序会当作空数据处理，首次保存时自动生成 `tasks.json` / `dayitems.json`。
