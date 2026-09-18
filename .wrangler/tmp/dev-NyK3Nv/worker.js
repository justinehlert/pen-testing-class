var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-tr0vdH/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/bundle-tr0vdH/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// worker.js
var REQUIRED_FIELDS = ["student_id", "hacker_handle", "filename", "public_ip", "data"];
var BASE_URL = "https://n.0g.rip";
var LOG_STORE = [];
var LANDING_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>The No Grip Elite Hackery Society</title>
  <style>
    :root {
      --bg: #050b08;
      --panel: #0d1f18;
      --green: #93ffb6;
      --cyan: #7af5ff;
      --muted: #c9e8d3;
      --border: rgba(147, 255, 182, 0.45);
      --glow: rgba(122, 245, 255, 0.18);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Consolas", "Courier New", monospace;
      background: radial-gradient(circle at top, #10251a 0%, var(--bg) 40%, #030806 100%);
      color: var(--green);
      padding: 36px 20px 60px;
    }
    .wrap {
      max-width: 1100px;
      margin: 0 auto;
      border: 1px solid var(--border);
      box-shadow: 0 0 28px var(--glow);
      background: rgba(13, 31, 24, 0.92);
    }
    .header {
      padding: 24px 28px;
      border-bottom: 1px solid var(--border);
      background: rgba(20, 42, 32, 0.85);
    }
    h1 {
      margin: 0 0 8px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-size: clamp(1.6rem, 3vw, 2.8rem);
    }
    .tag {
      color: var(--cyan);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-size: 0.8rem;
    }
    .content {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 20px;
      padding: 24px;
    }
    .panel {
      border: 1px solid var(--border);
      background: rgba(11, 24, 19, 0.88);
      padding: 20px;
    }
    h2 {
      margin-top: 0;
      color: var(--cyan);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 1rem;
    }
    .url {
      display: block;
      margin: 8px 0 16px;
      color: var(--green);
      font-weight: bold;
      word-break: break-all;
    }
    pre {
      margin: 0;
      background: rgba(5, 11, 8, 0.9);
      border: 1px solid var(--border);
      padding: 14px;
      color: var(--muted);
      overflow-x: auto;
    }
    ul {
      margin: 0;
      padding-left: 18px;
      line-height: 1.7;
    }
    a {
      color: var(--cyan);
    }
    @media (max-width: 800px) {
      .content { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>The No Grip Elite Hackery Society</h1>
      <div class="tag">Signal intake / artifact relay / student submission portal</div>
    </div>
    <div class="content">
      <div class="panel">
        <h2>Mission briefing</h2>
        <p>Use the root domain for all student submissions. The Society is collecting approved payload metadata and file references in a single intake stream.</p>
        <div>
          <strong>Landing page:</strong>
          <span class="url">${BASE_URL}/</span>
        </div>
        <div>
          <strong>Student POST endpoint:</strong>
          <span class="url">${BASE_URL}/</span>
        </div>
        <div>
          <strong>Dashboard:</strong>
          <span class="url">${BASE_URL}/dashboard</span>
        </div>
        <p>Required fields: <strong>student_id</strong>, <strong>hacker_handle</strong>, <strong>filename</strong>, <strong>public_ip</strong>, <strong>data</strong>.</p>
      </div>
      <div class="panel">
        <h2>Payload template</h2>
        <pre>{
  "student_id": "STU-001",
  "hacker_handle": "neo",
  "filename": "loot.txt",
  "public_ip": "203.0.113.15",
  "data": "C:\\Users\\student\\Documents\\*.txt"
}</pre>
      </div>
    </div>
  </div>
</body>
</html>`;
var DASHBOARD_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>The No Grip Elite Hackery Society | Dashboard</title>
  <style>
    :root {
      --bg: #050b08;
      --panel: #0d1f18;
      --green: #93ffb6;
      --cyan: #7af5ff;
      --muted: #c9e8d3;
      --border: rgba(147, 255, 182, 0.45);
      --glow: rgba(122, 245, 255, 0.18);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Consolas", "Courier New", monospace;
      background: radial-gradient(circle at top, #10251a 0%, var(--bg) 35%, #030806 100%);
      color: var(--green);
      padding: 32px 18px 60px;
    }
    .wrap {
      max-width: 1400px;
      margin: 0 auto;
      border: 1px solid var(--border);
      box-shadow: 0 0 30px var(--glow);
      background: rgba(13, 31, 24, 0.92);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      background: rgba(20, 42, 32, 0.85);
    }
    h1 {
      margin: 0;
      font-size: clamp(1.4rem, 2.2vw, 2.2rem);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .badge {
      color: var(--cyan);
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-size: 0.8rem;
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
      background: rgba(23, 60, 45, 0.9);
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
      padding: 26px;
      color: var(--muted);
    }
    .nav {
      padding: 12px 24px;
      border-bottom: 1px solid var(--border);
    }
    .nav a {
      color: var(--cyan);
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>The No Grip Elite Hackery Society</h1>
      <div class="badge">Dashboard</div>
    </div>
    <div class="nav"><a href="/">Return to intake</a></div>
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
        {{ROWS}}
      </tbody>
    </table>
  </div>
</body>
</html>`;
function sanitize(value) {
  if (value === void 0 || value === null) {
    return "";
  }
  return String(value).trim();
}
__name(sanitize, "sanitize");
function makeRow(entry) {
  return `
    <tr>
      <td>${entry.timestamp}</td>
      <td>${entry.student_id}</td>
      <td>${entry.hacker_handle}</td>
      <td>${entry.filename}</td>
      <td>${entry.public_ip}</td>
      <td>${entry.data}</td>
      <td>${entry.client_ip}</td>
    </tr>
  `;
}
__name(makeRow, "makeRow");
function loadEntries() {
  return LOG_STORE.slice(-250);
}
__name(loadEntries, "loadEntries");
function saveEntries(entries) {
  LOG_STORE.length = 0;
  LOG_STORE.push(...entries.slice(-250));
}
__name(saveEntries, "saveEntries");
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    if (method === "GET" && url.pathname === "/") {
      return new Response(LANDING_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
    if (method === "GET" && url.pathname === "/dashboard") {
      const entries = loadEntries();
      const rows = entries.slice().reverse().map(makeRow).join("") || '<tr><td colspan="7" class="empty">No payloads logged yet. Awaiting student submissions...</td></tr>';
      return new Response(DASHBOARD_HTML.replace("{{ROWS}}", rows), { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
    if (method === "POST" && url.pathname === "/") {
      try {
        const payload = await request.json();
        const missing = REQUIRED_FIELDS.filter((field) => {
          const value = payload?.[field];
          return value === void 0 || value === null || sanitize(value) === "";
        });
        if (missing.length > 0) {
          return Response.json({
            status: "rejected",
            reason: "Missing required fields",
            missing
          }, { status: 400 });
        }
        const clientIp = request.headers.get("cf-connecting-ip") || "unknown";
        const entry = {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          client_ip: clientIp,
          student_id: sanitize(payload.student_id),
          hacker_handle: sanitize(payload.hacker_handle),
          filename: sanitize(payload.filename),
          public_ip: sanitize(payload.public_ip),
          data: sanitize(payload.data)
        };
        const entries = loadEntries();
        entries.push(entry);
        saveEntries(entries);
        return Response.json({ status: "accepted", received: entry }, { status: 200 });
      } catch (error) {
        return Response.json({
          status: "rejected",
          reason: "Invalid JSON payload"
        }, { status: 400 });
      }
    }
    return new Response("Not found", { status: 404 });
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-tr0vdH/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-tr0vdH/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
