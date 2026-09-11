// ===== OPC Workbench Mock Data =====
// Centralized mock data source for all pages

const DB = {
  // --- User ---
  user: {
    name: "陈逸飞",
    avatar: "CY",
    plan: "Pro+",
    email: "chenyifei@opc.work",
    joinedDays: 128,
  },

  // --- Dashboard Stats ---
  stats: {
    todayTasks: 6,
    todayTasksDone: 3,
    monthRevenue: 28560,
    weekRevenue: 7820,
    pendingOrders: 2,
    activeWorkflows: 4,
    publishedToday: 5,
    totalPublished: 342,
    totalPlatforms: 12,
    aiCreditsUsed: 15600,
    aiCreditsTotal: 50000,
  },

  // --- Revenue Trend (last 7 days) ---
  revenueTrend: [
    { date: "周一", value: 820 },
    { date: "周二", value: 1240 },
    { date: "周三", value: 980 },
    { date: "周四", value: 1560 },
    { date: "周五", value: 1820 },
    { date: "周六", value: 980 },
    { date: "周日", value: 1420 },
  ],

  // --- Platform Performance ---
  platformPerformance: [
    { name: "抖音", icon: "DY", color: "#000", followers: 48200, views: 520000, engagement: 8.2, revenue: 8200, published: 28 },
    { name: "B站", icon: "BZ", color: "#FB7299", followers: 18600, views: 156000, engagement: 12.5, revenue: 4200, published: 42 },
    { name: "小红书", icon: "XHS", color: "#FF2442", followers: 32100, views: 98000, engagement: 15.8, revenue: 5600, published: 68 },
    { name: "知乎", icon: "ZH", color: "#0084FF", followers: 12800, views: 45000, engagement: 6.4, revenue: 2100, published: 35 },
    { name: "快手", icon: "KS", color: "#FF4906", followers: 24600, views: 180000, engagement: 7.1, revenue: 3800, published: 22 },
    { name: "视频号", icon: "SPH", color: "#07C160", followers: 9800, views: 32000, engagement: 9.3, revenue: 1500, published: 18 },
    { name: "今日头条", icon: "TT", color: "#FF0000", followers: 15400, views: 89000, engagement: 4.8, revenue: 1900, published: 56 },
    { name: "喜马拉雅", icon: "XML", color: "#8B2DE1", followers: 6800, views: 24000, engagement: 11.2, revenue: 3260, published: 15 },
  ],

  // --- Today's Tasks ---
  tasks: [
    { id: 1, title: "AI教育短视频 - 第15期脚本撰写", type: "创作", priority: "high", status: "in-progress", deadline: "18:00", platform: "抖音+快手" },
    { id: 2, title: "B站知识科普视频后期剪辑", type: "剪辑", priority: "medium", status: "pending", deadline: "明天", platform: "B站" },
    { id: 3, title: "小红书种草图文 - 冬季护肤", type: "创作", priority: "high", status: "in-progress", deadline: "15:00", platform: "小红书" },
    { id: 4, title: "星图品牌广告 - 客户确认稿", type: "交付", priority: "high", status: "review", deadline: "14:00", platform: "抖音" },
    { id: 5, title: "知乎专栏 - AI工具测评系列", type: "创作", priority: "low", status: "pending", deadline: "本周", platform: "知乎" },
    { id: 6, title: "喜马拉雅音频录制 - 第8章", type: "录制", priority: "medium", status: "completed", deadline: "已完成", platform: "喜马拉雅" },
  ],

  // --- Active Workflows ---
  workflows: [
    { id: 1, name: "每日短视频自动发布", status: "running", lastRun: "10分钟前", runsToday: 1, successRate: 98, trigger: "每日 08:00" },
    { id: 2, name: "GitHub PR 自动审查", status: "running", lastRun: "2小时前", runsToday: 3, successRate: 100, trigger: "Webhook" },
    { id: 3, name: "AI漫剧批量生产", status: "paused", lastRun: "昨天", runsToday: 0, successRate: 95, trigger: "手动" },
    { id: 4, name: "客户消息自动回复", status: "running", lastRun: "5分钟前", runsToday: 12, successRate: 92, trigger: "事件" },
  ],

  // --- AIGC Tools ---
  aiTools: [
    { id: 1, name: "豆包", category: "AI对话", icon: "DB", color: "#4E6EF2", desc: "文案创作·翻译·摘要", connected: true, calls: 3280 },
    { id: 2, name: "Trae", category: "AI编程", icon: "TR", color: "#6366F1", desc: "代码生成·Bug修复·重构", connected: true, calls: 560 },
    { id: 3, name: "ChatGPT", category: "AI对话", icon: "GP", color: "#10A37F", desc: "文本生成·函数调用·GPTs", connected: true, calls: 1850 },
    { id: 4, name: "Claude", category: "AI对话", icon: "CL", color: "#D97757", desc: "长文本分析·代码审查", connected: true, calls: 920 },
    { id: 5, name: "WorkBuddy", category: "AI助手", icon: "WB", color: "#06B6D4", desc: "任务理解·工具调用·编排", connected: true, calls: 420 },
    { id: 6, name: "即梦AI", category: "AI绘画", icon: "JM", color: "#FF6B6B", desc: "图片生成·风格化", connected: true, calls: 680 },
    { id: 7, name: "可灵AI", category: "AI视频", icon: "KL", color: "#8B5CF6", desc: "AI视频生成·图生视频", connected: true, calls: 240 },
    { id: 8, name: "Midjourney", category: "AI绘画", icon: "MJ", color: "#4B6CB7", desc: "图片生成·风格迁移", connected: false, calls: 0 },
    { id: 9, name: "ElevenLabs", category: "AI音频", icon: "EL", color: "#FF6B35", desc: "语音克隆·多语言TTS", connected: true, calls: 180 },
    { id: 10, name: "Azure TTS", category: "AI音频", icon: "AZ", color: "#0078D4", desc: "文字转语音·多语言", connected: true, calls: 320 },
    { id: 11, name: "MOKI", category: "AI短剧", icon: "MK", color: "#EC4899", desc: "AI漫剧批量生成", connected: true, calls: 45 },
    { id: 12, name: "Canva", category: "AI设计", icon: "CV", color: "#8B3DFF", desc: "模板设计·图片编辑", connected: false, calls: 0 },
  ],

  // --- Assets ---
  assets: [
    { id: 1, name: "AI教育系列-封面图.png", type: "image", size: "2.4MB", source: "即梦AI", date: "2025-01-08", tags: ["封面", "AI教育"] },
    { id: 2, name: "科普视频脚本-第12期.txt", type: "text", size: "18KB", source: "豆包", date: "2025-01-08", tags: ["脚本", "科普"] },
    { id: 3, name: "冬季护肤-产品图.jpg", type: "image", size: "1.8MB", source: "即梦AI", date: "2025-01-07", tags: ["种草", "护肤"] },
    { id: 4, name: "AI漫剧-第3集.mp4", type: "video", size: "45MB", source: "可灵AI", date: "2025-01-07", tags: ["漫剧", "AI"] },
    { id: 5, name: "旁白配音-第8章.mp3", type: "audio", size: "8.2MB", source: "ElevenLabs", date: "2025-01-06", tags: ["配音", "有声书"] },
    { id: 6, name: "知乎测评-大纲.md", type: "text", size: "12KB", source: "ChatGPT", date: "2025-01-06", tags: ["大纲", "测评"] },
    { id: 7, name: "品牌广告-初稿.mp4", type: "video", size: "62MB", source: "可灵AI", date: "2025-01-05", tags: ["广告", "商单"] },
    { id: 8, name: "短视频BGM-欢快版.mp3", type: "audio", size: "3.5MB", source: "本地", date: "2025-01-04", tags: ["BGM", "音乐"] },
  ],

  // --- Workflow Nodes (for editor) ---
  wfNodes: [
    { id: "trigger", type: "trigger", x: 40, y: 120, title: "定时触发", sub: "每日 08:00", icon: "clock", color: "var(--color-warning)" },
    { id: "ai1", type: "ai", x: 280, y: 40, title: "豆包生成脚本", sub: "AI 文本生成", icon: "pen", color: "var(--color-primary)" },
    { id: "ai2", type: "ai", x: 280, y: 200, title: "即梦AI分镜", sub: "AI 图片生成", icon: "image", color: "var(--color-accent)" },
    { id: "ai3", type: "ai", x: 520, y: 120, title: "可灵AI视频", sub: "AI 视频生成", icon: "video", color: "var(--color-primary)" },
    { id: "ai4", type: "ai", x: 760, y: 40, title: "Azure TTS配音", sub: "AI 音频生成", icon: "mic", color: "var(--color-accent)" },
    { id: "logic1", type: "logic", x: 760, y: 200, title: "格式适配", sub: "多平台适配", icon: "git-branch", color: "var(--color-success)" },
    { id: "action1", type: "action", x: 1000, y: 40, title: "发布-抖音", sub: "平台操作", icon: "send", color: "var(--color-danger)" },
    { id: "action2", type: "action", x: 1000, y: 200, title: "发布-B站", sub: "平台操作", icon: "send", color: "var(--color-danger)" },
  ],
  wfEdges: [
    { from: "trigger", to: "ai1" },
    { from: "trigger", to: "ai2" },
    { from: "ai1", to: "ai3" },
    { from: "ai2", to: "ai3" },
    { from: "ai3", to: "ai4" },
    { from: "ai3", to: "logic1" },
    { from: "ai4", to: "action1" },
    { from: "logic1", to: "action2" },
  ],

  // --- Distribution Platforms ---
  distPlatforms: [
    { name: "抖音", icon: "DY", color: "#000", aspect: "9:16", maxDur: "15min", selected: true, schedule: "09:00" },
    { name: "快手", icon: "KS", color: "#FF4906", aspect: "9:16", maxDur: "15min", selected: true, schedule: "09:05" },
    { name: "视频号", icon: "SPH", color: "#07C160", aspect: "9:16", maxDur: "10min", selected: true, schedule: "09:10" },
    { name: "B站", icon: "BZ", color: "#FB7299", aspect: "16:9", maxDur: "无限制", selected: true, schedule: "10:00" },
    { name: "小红书", icon: "XHS", color: "#FF2442", aspect: "3:4", maxDur: "图文", selected: true, schedule: "10:30" },
    { name: "知乎", icon: "ZH", color: "#0084FF", aspect: "16:9", maxDur: "无限制", selected: false, schedule: "" },
    { name: "今日头条", icon: "TT", color: "#FF0000", aspect: "16:9", maxDur: "30min", selected: false, schedule: "" },
    { name: "喜马拉雅", icon: "XML", color: "#8B2DE1", aspect: "音频", maxDur: "无限制", selected: false, schedule: "" },
  ],

  // --- Messages (Unified Inbox) ---
  messages: [
    { id: 1, platform: "飞书", platformIcon: "FS", platformColor: "#3370FF", sender: "张明远", senderAvatar: "ZM", content: "陈总，PRD文档我已经修改完了，麻烦您确认一下第3章的流程图部分", time: "5分钟前", priority: "high", read: false, type: "text" },
    { id: 2, platform: "钉钉", platformIcon: "DD", platformColor: "#0089FF", sender: "审批系统", senderAvatar: "SY", content: "差旅报销审批已通过，金额¥2,380，预计3个工作日内到账", time: "18分钟前", priority: "normal", read: false, type: "notification" },
    { id: 3, platform: "企业微信", platformIcon: "QW", platformColor: "#07C160", sender: "李总（客户）", senderAvatar: "LZ", content: "方案我收到了，整体不错，但能不能在第5页加一个竞品对比的数据？", time: "32分钟前", priority: "high", read: false, type: "text" },
    { id: 4, platform: "微信", platformIcon: "WX", platformColor: "#07C160", sender: "行业交流群", senderAvatar: "HY", content: "@陈逸飞 你上次分享的那个AI工具链接能再发一下吗？群里有朋友想要", time: "1小时前", priority: "normal", read: true, type: "group" },
    { id: 5, platform: "GitHub", platformIcon: "GH", platformColor: "#24292E", sender: "trae-agent-bot", senderAvatar: "TB", content: "PR #42 has been merged into main by @reviewer-bot. 3 files changed, +128 -24 lines", time: "2小时前", priority: "normal", read: true, type: "notification" },
    { id: 6, platform: "飞书", platformIcon: "FS", platformColor: "#3370FF", sender: "日程助手", senderAvatar: "RC", content: "日程提醒：14:00 产品评审会议，已加入会议链接", time: "3小时前", priority: "normal", read: true, type: "notification" },
    { id: 7, platform: "邮件", platformIcon: "EM", platformColor: "#EA4335", sender: "noreply@xiangtu.com", senderAvatar: "XT", content: "您在巨量星图的新商单邀请：品牌A科技 - AI教育短视频合作，预算¥8,000", time: "4小时前", priority: "high", read: false, type: "email" },
    { id: 8, platform: "企业微信", platformIcon: "QW", platformColor: "#07C160", sender: "王设计", senderAvatar: "WS", content: "封面图初稿做好了，发你看一下，需要调整的话告诉我", time: "5小时前", priority: "low", read: true, type: "file" },
  ],

  // --- Orders ---
  orders: [
    { id: "XT-2025-014", platform: "巨量星图", client: "品牌A科技", type: "AI教育短视频", budget: 8000, deadline: "5天后", status: "进行中" },
    { id: "TH-2025-031", platform: "塔猴", client: "匿名客户", type: "AI漫剧3集", budget: 9000, deadline: "7天后", status: "待接单" },
    { id: "YP-2025-008", platform: "一品威客", client: "某教育机构", type: "知识科普视频", budget: 3500, deadline: "3天后", status: "进行中" },
    { id: "KS-2025-006", platform: "快手聚星", client: "品牌B美妆", type: "种草短视频", budget: 5000, deadline: "已交付", status: "已完成" },
  ],

  // --- Analytics ---
  contentTrend: [
    { date: "1月", douyin: 28, bilibili: 42, xhs: 68, zhihu: 35 },
    { date: "2月", douyin: 32, bilibili: 38, xhs: 72, zhihu: 28 },
    { date: "3月", douyin: 35, bilibili: 45, xhs: 80, zhihu: 40 },
    { date: "4月", douyin: 30, bilibili: 42, xhs: 75, zhihu: 32 },
    { date: "5月", douyin: 38, bilibili: 48, xhs: 85, zhihu: 42 },
    { date: "6月", douyin: 42, bilibili: 50, xhs: 90, zhihu: 45 },
  ],
  revenueByPlatform: [
    { name: "抖音", value: 8200, color: "#000" },
    { name: "小红书", value: 5600, color: "#FF2442" },
    { name: "B站", value: 4200, color: "#FB7299" },
    { name: "喜马拉雅", value: 3260, color: "#8B2DE1" },
    { name: "快手", value: 3800, color: "#FF4906" },
    { name: "其他", value: 3500, color: "#64748B" },
  ],
  efficiencyData: {
    contentPerDay: 4.2,
    aiToolCalls: 8175,
    workflowRuns: 142,
    timeSaved: 86, // hours
    automationRate: 68, // %
    avgProductionTime: 45, // minutes per content
  },

  // --- Workflow Templates ---
  wfTemplates: [
    { name: "每日短视频自动发布", desc: "豆包脚本→即梦分镜→可灵视频→TTS→多平台发布", trigger: "定时 08:00", runs: 28, icon: "video" },
    { name: "GitHub PR 自动审查", desc: "PR创建→Trae分析→飞书通知→自动Comment", trigger: "Webhook", runs: 86, icon: "git-pull-request" },
    { name: "客户消息自动回复", desc: "消息→AI分析→生成回复→人工确认→发送", trigger: "事件", runs: 342, icon: "message-circle" },
    { name: "AI漫剧批量生产", desc: "剧本→MOKI分镜→可灵视频→配音→合成→接单", trigger: "手动", runs: 12, icon: "film" },
    { name: "小说连载自动发布", desc: "AI续写→审校→多平台同步发布", trigger: "定时", runs: 45, icon: "book-open" },
    { name: "周报自动生成", desc: "汇总数据→AI分析→生成报告→飞书发送", trigger: "周五 18:00", runs: 8, icon: "file-text" },
  ],

  // ===== Admin Backend Data =====

  // --- Admin Users ---
  adminUsers: [
    { id: 1, name: "陈逸飞", email: "chenyifei@opc.work", avatar: "CY", plan: "pro-plus", platforms: 12, workflows: 8, status: "active", joined: "2024-09-12", lastActive: "5分钟前" },
    { id: 2, name: "林书瑶", email: "linshuyao@opc.work", avatar: "LS", plan: "pro", platforms: 8, workflows: 4, status: "active", joined: "2024-10-03", lastActive: "1小时前" },
    { id: 3, name: "王浩然", email: "wanghaoran@opc.work", avatar: "WH", plan: "team", platforms: 15, workflows: 12, status: "active", joined: "2024-10-15", lastActive: "2小时前" },
    { id: 4, name: "赵雨菲", email: "zhaoyufei@opc.work", avatar: "ZY", plan: "free", platforms: 3, workflows: 1, status: "active", joined: "2024-11-20", lastActive: "3天前" },
    { id: 5, name: "刘思远", email: "liusiyuan@opc.work", avatar: "LS", plan: "pro", platforms: 6, workflows: 5, status: "suspended", joined: "2024-08-01", lastActive: "1周前" },
    { id: 6, name: "黄佳琪", email: "huangjiaqi@opc.work", avatar: "HJ", plan: "free", platforms: 2, workflows: 0, status: "pending", joined: "2025-01-05", lastActive: "从未" },
    { id: 7, name: "周明轩", email: "zhoumingxuan@opc.work", avatar: "ZM", plan: "pro-plus", platforms: 10, workflows: 7, status: "active", joined: "2024-09-28", lastActive: "30分钟前" },
    { id: 8, name: "吴晓彤", email: "wuxiaotong@opc.work", avatar: "WX", plan: "team", platforms: 14, workflows: 9, status: "active", joined: "2024-07-14", lastActive: "10分钟前" },
  ],

  // --- Connected Platform Accounts ---
  platformAccounts: [
    { id: 1, platform: "抖音", icon: "DY", color: "#000", account: "陈逸飞的创作号", accountId: "dy_8847291", authType: "OAuth2", status: "online", tokenExpiry: "2025-03-15", syncFreq: "实时" },
    { id: 2, platform: "B站", icon: "BZ", color: "#FB7299", account: "逸飞科普", accountId: "bili_39921056", authType: "OAuth2", status: "online", tokenExpiry: "2025-04-02", syncFreq: "每小时" },
    { id: 3, platform: "小红书", icon: "XHS", color: "#FF2442", account: "逸飞种草日记", accountId: "xhs_5521083", authType: "OAuth2", status: "online", tokenExpiry: "2025-02-28", syncFreq: "实时" },
    { id: 4, platform: "知乎", icon: "ZH", color: "#0084FF", account: "陈逸飞", accountId: "zh_1280934", authType: "OAuth2", status: "warning", tokenExpiry: "2025-01-20", syncFreq: "每小时" },
    { id: 5, platform: "快手", icon: "KS", color: "#FF4906", account: "逸飞快创作", accountId: "ks_991208", authType: "OAuth2", status: "online", tokenExpiry: "2025-03-30", syncFreq: "实时" },
    { id: 6, platform: "飞书", icon: "FS", color: "#3370FF", account: "OPC团队工作区", accountId: "lark_440182", authType: "OAuth2", status: "online", tokenExpiry: "长期有效", syncFreq: "实时" },
    { id: 7, platform: "钉钉", icon: "DD", color: "#0089FF", account: "逸飞工作室", accountId: "dd_887120", authType: "OAuth2", status: "offline", tokenExpiry: "已过期", syncFreq: "-" },
    { id: 8, platform: "企业微信", icon: "QW", color: "#07C160", account: "客户对接号", accountId: "qw_552091", authType: "OAuth2", status: "online", tokenExpiry: "2025-04-10", syncFreq: "实时" },
    { id: 9, platform: "GitHub", icon: "GH", color: "#24292E", account: "chenyifei-dev", accountId: "gh_88291", authType: "Token", status: "online", tokenExpiry: "长期有效", syncFreq: "Webhook" },
    { id: 10, platform: "巨量星图", icon: "XT", color: "#FF6B00", account: "逸飞创作者", accountId: "xt_66120", authType: "OAuth2", status: "online", tokenExpiry: "2025-03-01", syncFreq: "每日" },
  ],

  // --- AI Tool Configs ---
  aiToolConfigs: [
    { id: 1, name: "豆包", category: "AI对话", provider: "doubao", apiKey: "sk-doubao-****8421", model: "doubao-pro-32k", enabled: true, calls: 3280, cost: "¥65.60", rateLimit: "100/min" },
    { id: 2, name: "Trae", category: "AI编程", provider: "trae", apiKey: "sk-trae-****9203", model: "trae-agent-v2", enabled: true, calls: 560, cost: "¥28.00", rateLimit: "50/min" },
    { id: 3, name: "ChatGPT", category: "AI对话", provider: "openai", apiKey: "sk-openai-****1147", model: "gpt-4o", enabled: true, calls: 1850, cost: "$37.00", rateLimit: "60/min" },
    { id: 4, name: "Claude", category: "AI对话", provider: "anthropic", apiKey: "sk-ant-****8821", model: "claude-sonnet-4", enabled: true, calls: 920, cost: "$18.40", rateLimit: "40/min" },
    { id: 5, name: "WorkBuddy", category: "AI助手", provider: "workbuddy", apiKey: "wb-****4408", model: "wb-agent-v1", enabled: true, calls: 420, cost: "¥12.60", rateLimit: "30/min" },
    { id: 6, name: "即梦AI", category: "AI绘画", provider: "jimeng", apiKey: "jm-****7702", model: "jimeng-v3", enabled: true, calls: 680, cost: "¥34.00", rateLimit: "20/min" },
    { id: 7, name: "可灵AI", category: "AI视频", provider: "kling", apiKey: "kl-****6613", model: "kling-v2", enabled: true, calls: 240, cost: "¥48.00", rateLimit: "10/min" },
    { id: 8, name: "Midjourney", category: "AI绘画", provider: "midjourney", apiKey: "未配置", model: "mj-v6", enabled: false, calls: 0, cost: "¥0", rateLimit: "-" },
    { id: 9, name: "ElevenLabs", category: "AI音频", provider: "elevenlabs", apiKey: "el-****9942", model: "eleven-multilingual", enabled: true, calls: 180, cost: "$5.40", rateLimit: "5/min" },
    { id: 10, name: "Azure TTS", category: "AI音频", provider: "azure", apiKey: "az-****3308", model: "azure-tts-v2", enabled: true, calls: 320, cost: "¥6.40", rateLimit: "100/min" },
    { id: 11, name: "MOKI", category: "AI短剧", provider: "moki", apiKey: "mk-****5519", model: "moki-v1", enabled: true, calls: 45, cost: "¥22.50", rateLimit: "5/min" },
    { id: 12, name: "Canva", category: "AI设计", provider: "canva", apiKey: "未配置", model: "canva-v1", enabled: false, calls: 0, cost: "¥0", rateLimit: "-" },
  ],

  // --- Admin Orders ---
  adminOrders: [
    { id: "XT-2025-014", platform: "巨量星图", client: "品牌A科技", type: "AI教育短视频", budget: 8000, commission: 800, deadline: "5天后", status: "进行中", assignedTo: "陈逸飞" },
    { id: "TH-2025-031", platform: "塔猴", client: "匿名客户", type: "AI漫剧3集", budget: 9000, commission: 1350, deadline: "7天后", status: "待接单", assignedTo: "待分配" },
    { id: "YP-2025-008", platform: "一品威客", client: "某教育机构", type: "知识科普视频", budget: 3500, commission: 350, deadline: "3天后", status: "进行中", assignedTo: "林书瑶" },
    { id: "KS-2025-006", platform: "快手聚星", client: "品牌B美妆", type: "种草短视频", budget: 5000, commission: 500, deadline: "已交付", status: "已完成", assignedTo: "陈逸飞" },
    { id: "XT-2025-013", platform: "巨量星图", client: "品牌C数码", type: "产品测评视频", budget: 6500, commission: 650, deadline: "10天后", status: "进行中", assignedTo: "王浩然" },
    { id: "TH-2025-028", platform: "塔猴", client: "某MCN机构", type: "AI短剧5集", budget: 15000, commission: 2250, deadline: "14天后", status: "待接单", assignedTo: "待分配" },
    { id: "YP-2025-006", platform: "一品威客", client: "某餐饮品牌", type: "探店短视频", budget: 2800, commission: 280, deadline: "已交付", status: "已结算", assignedTo: "周明轩" },
    { id: "KS-2025-004", platform: "快手聚星", client: "品牌D服饰", type: "穿搭种草", budget: 4200, commission: 420, deadline: "2天后", status: "进行中", assignedTo: "吴晓彤" },
  ],

  // --- Admin Workflow Runs ---
  adminWorkflowRuns: [
    { id: "WF-2025-0142", name: "每日短视频自动发布", trigger: "定时 08:00", startedAt: "2025-01-08 08:00:02", duration: "4m 32s", steps: 6, status: "success", triggered: "自动" },
    { id: "WF-2025-0141", name: "GitHub PR 自动审查", trigger: "Webhook", startedAt: "2025-01-08 06:15:44", duration: "1m 08s", steps: 4, status: "success", triggered: "自动" },
    { id: "WF-2025-0140", name: "客户消息自动回复", trigger: "事件", startedAt: "2025-01-08 05:42:18", duration: "0m 22s", steps: 3, status: "success", triggered: "自动" },
    { id: "WF-2025-0139", name: "每日短视频自动发布", trigger: "定时 08:00", startedAt: "2025-01-07 08:00:01", duration: "5m 12s", steps: 6, status: "failed", triggered: "自动" },
    { id: "WF-2025-0138", name: "AI漫剧批量生产", trigger: "手动", startedAt: "2025-01-07 14:22:30", duration: "12m 45s", steps: 8, status: "success", triggered: "陈逸飞" },
    { id: "WF-2025-0137", name: "客户消息自动回复", trigger: "事件", startedAt: "2025-01-07 11:08:15", duration: "0m 18s", steps: 3, status: "success", triggered: "自动" },
    { id: "WF-2025-0136", name: "GitHub PR 自动审查", trigger: "Webhook", startedAt: "2025-01-07 09:30:12", duration: "1m 15s", steps: 4, status: "partial", triggered: "自动" },
    { id: "WF-2025-0135", name: "小说连载自动发布", trigger: "定时 20:00", startedAt: "2025-01-06 20:00:03", duration: "3m 28s", steps: 5, status: "success", triggered: "自动" },
  ],

  // --- System Logs ---
  systemLogs: [
    { time: "2025-01-08 10:23:14", level: "success", msg: "工作流 WF-2025-0142 执行完成，耗时 4m32s" },
    { time: "2025-01-08 10:18:02", level: "info", msg: "抖音平台 Token 已自动刷新，新过期时间 2025-03-15" },
    { time: "2025-01-08 10:15:33", level: "info", msg: "用户 周明轩 登录系统，IP: 114.88.xxx.xxx" },
    { time: "2025-01-08 10:08:47", level: "warn", msg: "知乎平台 Token 将于 12 天后过期，请及时续期" },
    { time: "2025-01-08 09:55:12", level: "success", msg: "内容已发布至 5 个平台：抖音/快手/视频号/B站/小红书" },
    { time: "2025-01-08 09:42:08", level: "info", msg: "AI 工具「豆包」调用成功，消耗 1,280 tokens" },
    { time: "2025-01-08 09:30:21", level: "error", msg: "钉钉平台同步失败：Token 已过期，请重新授权" },
    { time: "2025-01-08 09:15:44", level: "info", msg: "素材资产「AI教育-封面图.png」上传成功" },
    { time: "2025-01-08 08:00:02", level: "success", msg: "工作流「每日短视频自动发布」触发执行" },
    { time: "2025-01-08 07:58:10", level: "warn", msg: "AI 用量已达本月 31.2%，预计 15 天后达到配额上限" },
    { time: "2025-01-08 07:45:33", level: "info", msg: "系统自动备份完成，数据量 2.4GB" },
    { time: "2025-01-08 07:30:08", level: "success", msg: "GitHub Webhook 接收成功：PR #42 已合并" },
  ],

  // --- System Settings ---
  systemSettings: {
    general: { siteName: "OPC 一人公司工作台", language: "zh-CN", timezone: "Asia/Shanghai", pageSize: 20 },
    security: { twoFactor: true, sessionTimeout: 30, ipWhitelist: false, loginAlert: true, apiRateLimit: 100 },
    storage: { totalQuota: "50GB", usedQuota: "12.4GB", autoClean: true, cleanAfter: 30, backupFreq: "每日" },
    notification: { emailNotif: true, desktopNotif: true, soundNotif: false, digestFreq: "每日" },
  },

  // ===== vivo 办公套件 Data =====

  // --- vivo Office Apps ---
  vivoApps: [
    { id: 1, name: "vivo 文档", desc: "在线文档协作与编辑", connected: true, docs: 28, icon: "file-text", color: "#415FFF" },
    { id: 2, name: "vivo 日历", desc: "日程管理与智能提醒", connected: true, events: 12, icon: "calendar", color: "#00C2FF" },
    { id: 3, name: "vivo 邮件", desc: "邮件收发与智能分类", connected: true, unread: 5, icon: "mail", color: "#415FFF" },
    { id: 4, name: "vivo 云盘", desc: "文件存储与多端同步", connected: true, used: "8.2GB", icon: "cloud", color: "#00C2FF" },
    { id: 5, name: "vivo 会议", desc: "视频会议与屏幕共享", connected: true, upcoming: 1, icon: "video", color: "#415FFF" },
    { id: 6, name: "vivo 记事本", desc: "灵感记录与笔记管理", connected: true, notes: 45, icon: "sticky-note", color: "#00C2FF" },
    { id: 7, name: "vivo 联系人", desc: "通讯录与人脉管理", connected: true, contacts: 286, icon: "users", color: "#415FFF" },
    { id: 8, name: "vivo 应用商店", desc: "应用管理与自动更新", connected: false, icon: "package", color: "#00C2FF" },
  ],

  // --- vivo Connected Devices ---
  vivoDevices: [
    { id: 1, name: "vivo X100 Pro", detail: "天玑9300 · 16GB · 已同步", status: "online", lastSync: "刚刚" },
    { id: 2, name: "vivo Pad 3 Pro", detail: "天玑9300 · 12GB · 已同步", status: "online", lastSync: "2分钟前" },
    { id: 3, name: "vivo WATCH 3", detail: "蓝山版 · 健康监测中", status: "online", lastSync: "5分钟前" },
    { id: 4, name: "vivo TWS 4", detail: "蓝牙耳机 · 已连接", status: "online", lastSync: "实时" },
  ],

  // --- 小V Claw Chat History ---
  vivoChatHistory: [
    { role: "assistant", content: "你好！我是小V Claw，你的 vivo 智能办公助手。我可以帮你管理文档、日程、邮件，也可以直接在 OPC 工作台中操作。有什么我能帮你的？" },
    { role: "user", content: "帮我看看今天有什么日程安排" },
    { role: "assistant", content: "今天你有 3 个日程：\n\n1. 14:00 - 产品评审会议（vivo 会议）\n2. 16:30 - 客户李总电话沟通\n3. 19:00 - 内容选题周会\n\n其中产品评审会议的文档已经通过 vivo 文档共享给参会人员，你可以直接在会议中打开。需要我帮你做什么准备吗？" },
    { role: "user", content: "帮我生成一份会议纪要模板" },
    { role: "assistant", content: "已为你创建会议纪要模板！我已在 vivo 文档中生成了「产品评审会议-纪要模板」，包含以下模块：\n\n- 会议基本信息（时间/参会人/议题）\n- 讨论要点记录\n- 决策事项\n- 待办任务分配\n- 下次会议预告\n\n你可以点击这里直接打开编辑。需要我把今天的会议信息自动填充进去吗？" },
  ],

  // --- 小V Claw Quick Actions ---
  vivoQuickActions: [
    "查看今日日程",
    "检查未读邮件",
    "创建会议邀请",
    "同步文件到云盘",
    "生成工作周报",
    "翻译最近文档",
    "查找联系人",
    "设置日程提醒",
  ],

  // --- 小V Claw Capabilities ---
  vivoCapabilities: [
    { name: "跨端协同", desc: "手机/平板/手表无缝流转", icon: "link" },
    { name: "文档协作", desc: "多人实时编辑与评论", icon: "file-text" },
    { name: "智能日程", desc: "AI 自动排期与冲突检测", icon: "calendar" },
    { name: "语音转写", desc: "会议录音实时转文字", icon: "mic" },
    { name: "邮件助手", desc: "AI 摘要与智能回复", icon: "mail" },
    { name: "文件互传", desc: "设备间快速传输文件", icon: "share" },
  ],
};