#!/usr/bin/env node
'use strict';

/**
 * 工作事项看板 —— 本地数据持久化服务
 *
 * 用 Node 内置 http 模块实现一个极简服务：
 *  - 任务数据存到 tasks.json，当日事项存到 dayitems.json
 *  - 前端 work-board.html 通过 /api/tasks、/api/dayitems 读写数据
 *  - 其它路径当作静态文件返回；访问根路径 "/" 时返回 work-board.html
 *
 * 启动：node server.js  然后浏览器打开 http://localhost:8787
 */
var http = require('http');
var fs = require('fs');
var path = require('path');

var ROOT = __dirname;                                    // 项目根目录，也是静态文件根
var DATA_FILE = path.join(ROOT, 'tasks.json');           // 任务数据文件
var DAYITEMS_FILE = path.join(ROOT, 'dayitems.json');    // 当日事项数据文件
var PORT = process.env.PORT || 8787;                     // 端口，可用环境变量覆盖

// 常见静态文件类型的 Content-Type，缺省按二进制流返回
var MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

// 读取任务数据：文件不存在或解析失败时返回空数组，保证服务不会因坏文件崩溃
function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

// 写入任务数据（整体覆盖，缩进 2 空格便于人工查看/对比）
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// 读取当日事项数据（逻辑同 readData）
function readDayItems() {
  try {
    return JSON.parse(fs.readFileSync(DAYITEMS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

// 写入当日事项数据
function writeDayItems(data) {
  fs.writeFileSync(DAYITEMS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

var server = http.createServer(function (req, res) {
  // 解析路径（去掉查询串、做 URL 解码）
  var pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);

  // GET /api/tasks —— 读取任务列表
  if (pathname === '/api/tasks' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(readData()));
    return;
  }

  // PUT /api/tasks —— 保存任务列表（前端整体覆盖写入）
  if (pathname === '/api/tasks' && req.method === 'PUT') {
    var body = '';
    // 流式接收请求体，超过 50MB 直接断连，防止异常大请求拖垮进程
    req.on('data', function (c) { body += c; if (body.length > 50e6) req.destroy(); });
    req.on('end', function () {
      try {
        var data = JSON.parse(body);
        if (!Array.isArray(data)) throw new Error('数据必须是数组');
        writeData(data);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  // GET /api/dayitems —— 读取当日事项
  if (pathname === '/api/dayitems' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(readDayItems()));
    return;
  }

  // PUT /api/dayitems —— 保存当日事项
  if (pathname === '/api/dayitems' && req.method === 'PUT') {
    var body2 = '';
    req.on('data', function (c) { body2 += c; if (body2.length > 50e6) req.destroy(); });
    req.on('end', function () {
      try {
        var data = JSON.parse(body2);
        if (!Array.isArray(data)) throw new Error('数据必须是数组');
        writeDayItems(data);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  // 静态文件：根路径映射到 work-board.html
  if (pathname === '/') pathname = '/work-board.html';
  // 归一化路径并做目录穿越防护（去掉 "../" 和开头的斜杠）
  var rel = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '');
  var filePath = path.join(ROOT, rel);
  if (filePath.indexOf(ROOT) !== 0) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(filePath, function (err, buf) {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    var ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(buf);
  });
});

server.listen(PORT, function () {
  console.log('');
  console.log('  工作事项看板已启动');
  console.log('  打开:  http://localhost:' + PORT);
  console.log('  数据文件: ' + DATA_FILE);
  console.log('  按 Ctrl+C 停止');
  console.log('');
});
