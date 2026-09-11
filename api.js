// ===== OPC Workbench API Stubs =====
// Async service layer with mock data — signatures match future real API
// TODO: replace with real fetch() calls to backend

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// --- Dashboard ---
// GET /api/dashboard/stats
async function fetchDashboardStats() {
  await delay(300);
  return { code: 0, data: DB.stats };
}

// GET /api/dashboard/tasks
async function fetchTodayTasks() {
  await delay(300);
  return { code: 0, data: DB.tasks };
}

// GET /api/dashboard/workflows
async function fetchActiveWorkflows() {
  await delay(300);
  return { code: 0, data: DB.workflows };
}

// GET /api/dashboard/platform-performance
async function fetchPlatformPerformance() {
  await delay(300);
  return { code: 0, data: DB.platformPerformance };
}

// --- AIGC Creation ---
// GET /api/ai-tools
async function fetchAITools() {
  await delay(300);
  return { code: 0, data: DB.aiTools };
}

// GET /api/assets
async function fetchAssets() {
  await delay(300);
  return { code: 0, data: DB.assets };
}

// POST /api/ai/execute
async function executeAITool(toolName, prompt) {
  await delay(800);
  // TODO: replace with real AI API call
  return { code: 0, data: { result: `[${toolName}] 已处理您的请求: "${prompt.slice(0, 40)}..."`, status: "success" } };
}

// --- Workflow ---
// GET /api/workflows/templates
async function fetchWorkflowTemplates() {
  await delay(300);
  return { code: 0, data: DB.wfTemplates };
}

// GET /api/workflow/nodes
async function fetchWorkflowNodes() {
  await delay(300);
  return { code: 0, data: { nodes: DB.wfNodes, edges: DB.wfEdges } };
}

// --- Distribution ---
// GET /api/distribution/platforms
async function fetchDistPlatforms() {
  await delay(300);
  return { code: 0, data: DB.distPlatforms };
}

// POST /api/distribution/publish
async function publishContent(platforms, schedule) {
  await delay(600);
  // TODO: replace with real platform API calls
  return { code: 0, data: { published: platforms.length, scheduled: schedule, status: "queued" } };
}

// --- Inbox ---
// GET /api/messages
async function fetchMessages() {
  await delay(300);
  return { code: 0, data: DB.messages };
}

// POST /api/messages/reply
async function sendMessage(platform, recipient, content) {
  await delay(500);
  // TODO: replace with real platform messaging API
  return { code: 0, data: { sent: true, platform, recipient } };
}

// --- Analytics ---
// GET /api/analytics/content-trend
async function fetchContentTrend() {
  await delay(300);
  return { code: 0, data: DB.contentTrend };
}

// GET /api/analytics/revenue
async function fetchRevenueByPlatform() {
  await delay(300);
  return { code: 0, data: DB.revenueByPlatform };
}

// GET /api/analytics/efficiency
async function fetchEfficiency() {
  await delay(300);
  return { code: 0, data: DB.efficiencyData };
}

// GET /api/orders
async function fetchOrders() {
  await delay(300);
  return { code: 0, data: DB.orders.filter(o => o.id) };
}