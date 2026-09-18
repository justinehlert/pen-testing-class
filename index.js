const express = require('express');
const { exec } = require('child_process');
const app = express();

app.use(express.json({ limit: '1mb' }));
app.set('trust proxy', true);

const requiredFields = ['student_id', 'hacker_handle', 'filename', 'public_ip', 'data'];
let logs = [];

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }

  return req.socket?.remoteAddress || 'unknown';
}

function sanitizeString(value) {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value).trim();
}

function hashString(input) {
  let hash = 0;
  for (const char of String(input || '')) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function buildPingSimulation(rawTarget) {
  const commandString = sanitizeString(rawTarget) || '8.8.8.8';
  const commands = commandString
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);

  const pingTarget = commands[0] || '8.8.8.8';
  const latency = 2 + (hashString(pingTarget) % 15) + ((hashString(`${pingTarget}:latency`) % 10) * 0.3);
  const pingOutput = [
    `PING ${pingTarget} (${pingTarget}) 56(84) bytes of data.`,
    `64 bytes from ${pingTarget}: icmp_seq=1 ttl=58 time=${latency.toFixed(1)} ms`,
    '',
    `--- ${pingTarget} ping statistics ---`,
    '1 packets transmitted, 1 received, 0% packet loss',
    `round-trip min/avg/max = ${latency.toFixed(1)}/${latency.toFixed(1)}/${latency.toFixed(1)} ms`
  ];

  const shellOutput = [];
  shellOutput.push(`$ ${commandString}`);
  shellOutput.push(...pingOutput);

  if (commandString.includes(';')) {
    const injectedCommands = commands.slice(1);
    injectedCommands.forEach((command) => {
      if (/^ls$/i.test(command)) {
        shellOutput.push('');
        shellOutput.push('$ ls');
        shellOutput.push('app  bin  boot  dev  etc  home  lib  root  usr  var');
      } else if (/^pwd$/i.test(command)) {
        shellOutput.push('');
        shellOutput.push('$ pwd');
        shellOutput.push('/var/www/html');
      } else if (/^curl\s+google\.com$/i.test(command)) {
        shellOutput.push('');
        shellOutput.push('$ curl google.com');
        shellOutput.push('<html><head><title>Google</title></head><body><h1>Google</h1></body></html>');
      } else if (/^cat\\\s+\/etc\/passwd$/i.test(command)) {
        shellOutput.push('');
        shellOutput.push('$ cat\\ /etc/passwd');
        shellOutput.push('root:x:0:0:root:/root:/bin/bash');
        shellOutput.push('daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin');
        shellOutput.push('www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin');
        shellOutput.push('student:x:1000:1000:Student:/home/student:/bin/bash');
      } else {
        shellOutput.push('');
        shellOutput.push(`$ ${command}`);
        shellOutput.push('command executed');
      }
    });
  }

  return {
    target: commandString,
    command: commandString,
    output: shellOutput.join('\n').trim()
  };
}

async function runPingCommand(target) {
  return buildPingSimulation(target);
}

app.post('/log', (req, res) => {
  const payload = req.body && typeof req.body === 'object' ? req.body : {};
  const missing = requiredFields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || sanitizeString(value) === '';
  });

  if (missing.length > 0) {
    return res.status(400).json({
      status: 'rejected',
      reason: 'Missing required fields',
      missing
    });
  }

  const time = new Date().toISOString();
  const entry = {
    timestamp: time,
    client_ip: getClientIp(req),
    student_id: sanitizeString(payload.student_id),
    hacker_handle: sanitizeString(payload.hacker_handle),
    filename: sanitizeString(payload.filename),
    public_ip: sanitizeString(payload.public_ip),
    data: sanitizeString(payload.data)
  };

  logs.push(entry);
  return res.status(200).json({ status: 'accepted', received: entry });
});

app.get('/', (req, res) => {
  const rows = logs
    .slice()
    .reverse()
    .map((log) => `
      <tr>
        <td>${log.timestamp}</td>
        <td>${log.student_id}</td>
        <td>${log.hacker_handle}</td>
        <td>${log.filename}</td>
        <td>${log.public_ip}</td>
        <td>${log.data}</td>
        <td>${log.client_ip}</td>
      </tr>
    `)
    .join('');

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Retro Hacker Ops Console</title>
      <style>
        :root {
          --bg: #07130d;
          --panel: #0d1f18;
          --green: #7ef7b8;
          --green-soft: #4fe39d;
          --cyan: #78f4ff;
          --muted: #b7d9c3;
          --border: rgba(126, 247, 184, 0.5);
        }
        body {
          margin: 0;
          background: radial-gradient(circle at top, #0d261d 0%, var(--bg) 45%, #050b08 100%);
          color: var(--green);
          font-family: "Consolas", "Courier New", monospace;
          padding: 32px;
        }
        .console {
          max-width: 1400px;
          margin: 0 auto;
          border: 1px solid var(--border);
          background: rgba(13, 31, 24, 0.9);
          box-shadow: 0 0 25px rgba(126, 247, 184, 0.2);
        }
        .header {
          padding: 18px 22px;
          border-bottom: 1px solid var(--border);
          background: rgba(18, 49, 36, 0.8);
        }
        h1 {
          margin: 0;
          font-size: 1.8rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .status {
          color: var(--cyan);
          margin-top: 8px;
          font-size: 0.9rem;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid var(--border);
          padding: 10px 12px;
          text-align: left;
          vertical-align: top;
        }
        th {
          background: rgba(27, 63, 48, 0.9);
          color: var(--cyan);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        td {
          color: var(--muted);
          word-break: break-word;
        }
        .empty {
          text-align: center;
          padding: 24px;
          color: var(--muted);
        }
      </style>
    </head>
    <body>
      <div class="console">
        <div class="header">
          <h1>Retro Hacker Ops Console</h1>
          <div class="status">// student telemetry / live capture / authorized payloads only</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Student ID</th>
              <th>Hacker Handle</th>
              <th>Filename</th>
              <th>Public IP</th>
              <th>Data</th>
              <th>Source IP</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="7" class="empty">No payloads logged yet. Awaiting student submissions...</td></tr>'}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `);
});

app.get('/speedtest', async (req, res) => {
  const rawUrl = req.originalUrl || req.url || '';
  const match = rawUrl.match(/[?&]target=([^&]+)/i);
  const target = match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : (req.query.target || '8.8.8.8');
  const result = await runPingCommand(target);

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Speedtest Console</title>
      <style>
        body {
          margin: 0;
          background: #050b08;
          color: #9df7b8;
          font-family: "Consolas", "Courier New", monospace;
          padding: 32px;
        }
        .box {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid rgba(157, 247, 184, 0.5);
          background: rgba(10, 25, 19, 0.95);
          box-shadow: 0 0 24px rgba(157, 247, 184, 0.25);
          padding: 24px;
        }
        h1 {
          margin-top: 0;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-size: 1.3rem;
        }
        form {
          margin-bottom: 18px;
        }
        input {
          width: 100%;
          padding: 12px;
          margin-top: 8px;
          background: #020705;
          color: #9df7b8;
          border: 1px solid rgba(157, 247, 184, 0.5);
          font-family: inherit;
          font-size: 1rem;
        }
        button {
          margin-top: 12px;
          padding: 10px 18px;
          background: rgba(18, 49, 36, 0.9);
          color: #9df7b8;
          border: 1px solid rgba(157, 247, 184, 0.5);
          font-family: inherit;
          cursor: pointer;
        }
        pre {
          margin: 0;
          padding: 16px;
          white-space: pre-wrap;
          background: rgba(2, 7, 5, 0.9);
          border: 1px solid rgba(157, 247, 184, 0.5);
          color: #9df7b8;
        }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>Speedtest / Network Probe</h1>
        <form method="GET" action="/speedtest">
          <label for="target">Target</label>
          <input id="target" name="target" value="${String(result.target).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}" />
          <button type="submit">Run ping</button>
        </form>
        <pre>${result.output}</pre>
      </div>
    </body>
    </html>
  `);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Retro Hacker listener running on port ${port}`));