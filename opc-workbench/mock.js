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
};
