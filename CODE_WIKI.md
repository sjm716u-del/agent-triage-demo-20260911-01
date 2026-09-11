# Trae Agent — Code Wiki

> 本文档基于对 [bytedance/trae-agent](https://github.com/bytedance/trae-agent) 仓库（commit `e839e55`）的源码分析自动生成，旨在提供结构化、完整的代码知识库。
> 技术细节请参考 [arXiv 技术报告](https://arxiv.org/abs/2507.23370)。

---

## 目录

1. [项目概述](#1-项目概述)
2. [项目整体架构](#2-项目整体架构)
3. [目录结构](#3-目录结构)
4. [核心模块职责详解](#4-核心模块职责详解)
   - 4.1 [CLI 入口层 `trae_agent/cli.py`](#41-cli-入口层-trae_agentclipy)
   - 4.2 [Agent 核心层 `trae_agent/agent/`](#42-agent-核心层-trae_agentagent)
   - 4.3 [工具层 `trae_agent/tools/`](#43-工具层-trae_agenttools)
   - 4.4 [LLM 客户端层 `trae_agent/utils/llm_clients/`](#44-llm-客户端层-trae_agentutilsllm_clients)
   - 4.5 [配置与工具层 `trae_agent/utils/`](#45-配置与工具层-trae_agentutils)
   - 4.6 [系统提示词 `trae_agent/prompt/`](#46-系统提示词-trae_agentprompt)
   - 4.7 [Server 服务模块 `server/`](#47-server-服务模块-server)
   - 4.8 [评测系统 `evaluation/`](#48-评测系统-evaluation)
   - 4.9 [测试套件 `tests/`](#49-测试套件-tests)
   - 4.10 [文档 `docs/`](#410-文档-docs)
   - 4.11 [二进制分发 `trae_agent/dist/`](#411-二进制分发-trae_agentdist)
5. [端到端执行流程](#5-端到端执行流程)
6. [依赖关系](#6-依赖关系)
7. [项目运行方式](#7-项目运行方式)
8. [扩展点与设计要点](#8-扩展点与设计要点)

---

## 1. 项目概述

**Trae Agent** 是字节跳动开源的基于 LLM 的通用软件工程 Agent。它提供一个强大的 CLI 接口（`trae-cli`），能够理解自然语言指令，并利用各种工具与 LLM Provider 执行复杂的软件工程工作流（如修 Bug、加测试、重构等）。

### 核心特征

| 特性 | 说明 |
|---|---|
| 🌊 Lakeview | 对 Agent 每一步生成简短精炼的摘要（双 LLM pass：抽取任务细节 + 打标签）|
| 🤖 多 LLM 支持 | OpenAI、Anthropic、Doubao、Azure、OpenRouter、Ollama、Google Gemini |
| 🛠️ 丰富工具生态 | 文件编辑（str_replace）、JSON 编辑（JSONPath）、bash 执行、sequential thinking、CKG 代码知识图谱、MCP 工具桥接 |
| 🎯 交互模式 | 支持会话式交互界面（Rich Textual TUI）|
| 📊 轨迹记录 | 自动记录全部 LLM 交互、Agent 步骤、工具调用，用于调试与分析 |
| ⚙️ 灵活配置 | YAML 配置 + 环境变量 + CLI 参数三级覆盖 |
| 🚀 Docker 沙箱 | 支持在 Docker 容器内隔离执行 bash/编辑工具 |
| 🔧 MCP 集成 | 可选启用 Model Context Protocol 服务，动态发现外部工具 |

### 与其他 CLI Agent 的差异

Trae Agent 提供透明、模块化的架构，研究人员和开发者可轻松修改、扩展、分析，使其成为**研究 AI Agent 架构、进行消融实验、开发新 Agent 能力**的理想平台。这种**"研究友好设计"** 让学术界与开源社区能在快速演进的 AI Agent 领域共同贡献。

### 项目元信息

- **语言/版本**：Python 3.12+
- **构建系统**：Hatchling
- **依赖管理**：uv（含 `uv.lock`，290KB 锁定全部依赖）
- **入口脚本**：`trae-cli = "trae_agent.cli:main"`
- **License**：MIT
- **arXiv**：2507.23370

---

## 2. 项目整体架构

Trae Agent 采用清晰的分层架构，从 CLI 入口到 LLM 调用、工具执行形成一条完整的执行链。

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLI 入口层 (cli.py)                           │
│   trae-cli run / interactive / show-config / tools                   │
│   Click + asyncio · 参数解析 · 配置加载 · Docker 预构建              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ 实例化
┌──────────────────────────────▼──────────────────────────────────────┐
│                    Agent 编排层 (agent/)                            │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────────────────┐ │
│  │  Agent      │   │ BaseAgent    │   │ TraeAgent                │ │
│  │  (facade)   │──▶│ (抽象循环)   │◀──│ (具体实现:系统提示/      │ │
│  │  分发器     │   │ LLM/工具/轨迹│   │  task_done/MCP/patch)    │ │
│  └─────────────┘   └──────┬───────┘   └──────────────────────────┘ │
│                           │                                         │
│                   ┌───────▼───────┐                                 │
│                   │ agent_basics  │  数据模型层                     │
│                   │ (状态/步骤)   │                                 │
│                   └───────────────┘                                 │
│                   ┌───────────────┐                                 │
│                   │ DockerManager │  沙箱容器生命周期               │
│                   └───────────────┘                                 │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ 调用
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
┌───────────────────┐ ┌─────────────────┐ ┌──────────────────────┐
│  LLM 客户端层     │ │  工具层         │ │  工具执行器          │
│  (utils/llm_      │ │  (tools/)       │ │  ToolExecutor        │
│   clients/)       │ │                 │ │  DockerToolExecutor  │
│  OpenAI/Anthropic │ │ bash/edit/json/ │ │  (顺序/并行调度)      │
│  Google/Ollama... │ │ ckg/mcp/...     │ │                       │
└─────────┬────────┘ └─────────────────┘ └──────────────────────┘
          │ LLM Response (含 tool_calls)
          └──────────────────────────────────▶ 反馈给 Agent 循环

┌─────────────────────────────────────────────────────────────────────┐
│                    横切关注点 (utils/)                              │
│  Config (YAML/JSON) · TrajectoryRecorder · LakeView · MCPClient     │
│  CLI Console (Simple/Rich Textual) · constants                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 架构分层要点

1. **CLI 入口层**：解析参数、加载配置、构建 Agent、分发执行
2. **Agent 编排层**：`BaseAgent` 定义通用 Agentic 循环（LLM 调用 → 工具分发 → 轨迹记录 → 完成）；`TraeAgent` 具体化系统提示、`task_done` 完成语义、MCP 发现、patch 处理
3. **LLM 客户端层**：`LLMClient` 工厂按 provider 懒加载具体客户端；统一 `chat()` 接口
4. **工具层**：`Tool` 抽象基类 + `ToolExecutor` 调度器；6 个内置工具 + 动态 MCP 工具 + Docker 沙箱包装
5. **横切关注点**：配置、轨迹记录、Lakeview 摘要、MCP 客户端、控制台 UI

---

## 3. 目录结构

```
trae-agent/
├── trae_agent/                 # 主 Python 包
│   ├── __init__.py             # 版本 + 公共导出 (__version__="0.1.0")
│   ├── cli.py                  # CLI 入口 (Click), ~24KB
│   ├── agent/                  # Agent 核心
│   │   ├── __init__.py
│   │   ├── agent.py            # Agent facade + AgentType 枚举
│   │   ├── agent_basics.py     # 数据模型 (AgentStep/Execution/State)
│   │   ├── base_agent.py       # 抽象 Agentic 循环 (~14KB)
│   │   ├── trae_agent.py       # 具体 SWE Agent (~10KB)
│   │   └── docker_manager.py   # Docker 容器生命周期 (~11KB)
│   ├── tools/                  # 工具层
│   │   ├── __init__.py          # tools_registry 注册表
│   │   ├── base.py             # Tool 抽象 + ToolExecutor 调度
│   │   ├── bash_tool.py        # 持久 bash 会话
│   │   ├── edit_tool.py        # str_replace 文件编辑
│   │   ├── edit_tool_cli.py    # 独立 CLI 版 (Docker 内用)
│   │   ├── json_edit_tool.py   # JSONPath JSON 编辑
│   │   ├── json_edit_tool_cli.py # 独立 CLI 版
│   │   ├── ckg_tool.py         # 代码知识图谱查询工具
│   │   ├── ckg/                # CKG 引擎
│   │   │   ├── base.py         # 数据条目 + 语言映射
│   │   │   └── ckg_database.py # tree-sitter 解析 + SQLite 存储
│   │   ├── docker_tool_executor.py # Docker 沙箱工具执行器
│   │   ├── mcp_tool.py         # MCP 工具适配器
│   │   ├── run.py              # 共享异步 shell 运行器
│   │   ├── sequential_thinking_tool.py # 结构化思考工具
│   │   └── task_done_tool.py   # 任务完成信号工具
│   ├── utils/                  # 工具与配置
│   │   ├── config.py           # YAML 配置加载 (~14KB)
│   │   ├── legacy_config.py    # 旧版 JSON 配置兼容
│   │   ├── constants.py        # LOCAL_STORAGE_PATH 常量
│   │   ├── lake_view.py        # Lakeview 步骤摘要 (~9KB)
│   │   ├── trajectory_recorder.py # 轨迹记录 (~10KB)
│   │   ├── mcp_client.py       # MCP 客户端
│   │   ├── cli/                # 控制台 UI
│   │   │   ├── cli_console.py      # 抽象 CLIConsole + ConsoleFactory
│   │   │   ├── simple_console.py   # Simple Rich 表格控制台
│   │   │   └── rich_console.py     # Textual TUI 富控制台
│   │   └── llm_clients/        # LLM 客户端
│   │       ├── llm_client.py          # LLMClient 工厂
│   │       ├── base_client.py         # BaseLLMClient 抽象
│   │       ├── llm_basics.py          # LLMResponse/LLMMessage/LLMUsage 等
│   │       ├── openai_compatible_base.py # OpenAI 兼容基类
│   │       ├── openai_client.py       # OpenAI (Responses API)
│   │       ├── anthropic_client.py    # Anthropic 原生
│   │       ├── google_client.py       # Google Gemini 原生
│   │       ├── ollama_client.py       # Ollama 本地
│   │       ├── azure_client.py        # Azure OpenAI
│   │       ├── doubao_client.py        # 字节豆包
│   │       ├── openrouter_client.py   # OpenRouter 聚合器
│   │       └── retry_utils.py         # 重试工具
│   ├── prompt/                 # 系统提示词
│   │   ├── __init__.py
│   │   └── agent_prompt.py     # TRAE_AGENT_SYSTEM_PROMPT 常量
│   └── dist/                   # 二进制分发
│       └── dist_tools/         # PyInstaller 冻结的工具二进制
│           ├── edit_tool       # (~2.1MB)
│           └── json_edit_tool  # (~2.1MB)
├── server/                     # 服务模块 (设计阶段)
│   └── Readme.md               # HTTP API 设计规范
├── evaluation/                 # 评测系统
│   ├── __init__.py
│   ├── README.md
│   ├── setup.sh                # 评测环境安装
│   ├── utils.py                # 评测工具函数
│   ├── run_evaluation.py       # 评测主流程
│   └── patch_selection/        # 补丁选择 Agent (研究产物)
│       ├── README.md
│       ├── analysis.py
│       ├── selector.py
│       ├── example/example.jsonl
│       └── trae_selector/      # Selector Agent 实现
│           ├── __init__.py
│           ├── sandbox.py      # pexpect Docker 沙箱
│           ├── selector_agent.py
│           ├── selector_evaluation.py
│           ├── utils.py
│           └── tools/tools/    # 沙箱内工具实现
├── tests/                      # 测试套件
│   ├── test_cli.py
│   ├── agent/test_trae_agent.py
│   ├── tools/  (test_bash/edit/json_edit/mcp_tool)
│   └── utils/  (test_config/google/mcp/ollama/openrouter_client)
├── docs/                       # 文档
│   ├── tools.md                # 工具参考
│   ├── legacy_config.md        # 旧版配置
│   ├── TRAJECTORY_RECORDING.md # 轨迹记录规范
│   └── roadmap.md              # 路线图
├── pyproject.toml              # 项目配置
├── uv.lock                     # 依赖锁定
├── Makefile                    # 构建目标
├── trae_config.yaml.example    # YAML 配置示例
├── trae_config.json.example    # 旧版 JSON 配置示例
├── CONTRIBUTING.md
├── LICENSE
└── .pre-commit-config.yaml
```

---

## 4. 核心模块职责详解

### 4.1 CLI 入口层 `trae_agent/cli.py`

**文件路径**：`trae_agent/cli.py`（~24KB）

**职责**：基于 Click 的命令行接口，是整个系统的用户入口。解析参数、加载配置、构建 Agent 并执行任务。

**关键组件**：

| 组件 | 类型 | 说明 |
|---|---|---|
| `cli` | Click Group | 顶层命令组，绑定 `run`/`interactive`/`show-config`/`tools` 子命令 |
| `run` | 命令 | 一次性任务执行。加载 `.env` + `Config`，可选为 Docker 预构建 PyInstaller 二进制，解析绝对 `working_dir`，构建 `task_args`（`project_path`/`issue`/`must_patch`/`patch_path`），实例化 `Agent` 并 `await agent.run()` |
| `interactive` | 命令 | 交互 REPL 模式。支持 `status`/`help`/`clear`/`exit`/`quit` 指令，其余输入作为任务执行 |
| `show_config` | 命令 | 打印当前配置。`anthropic` provider 特殊处理（含 Top K 参数）|
| `tools` | 命令 | 列出可用工具及其参数 schema |
| `resolve_config_file` | 函数 | 定位配置文件：默认 `trae_config.yaml`，JSON 向后兼容 |
| `check_docker` | 函数 | 检查 Docker 可用性 |
| `build_with_pyinstaller` | 函数 | 为 Docker 模式构建工具二进制 |
| `main` | 函数 | 入口点，注册到 `pyproject.toml` 的 `trae-cli` 脚本 |

**关键 CLI 参数**（`run` 子命令）：
- 位置参数 `task`：任务描述；`--file`：从文件读取任务（二者互斥）
- `--provider`/`--model`/`--model-base-url`/`--api-key`：LLM 覆盖
- `--working-dir`：工作目录（转为绝对路径）
- `--max-steps`：最大步数
- `--trajectory-file`：轨迹输出路径（默认 `trajectories/trajectory_YYYYMMDD_HHMMSS.json`）
- `--must-patch`：强制要求生成非空 patch（SWE-bench 风格）
- `--docker-image`/`--docker-container-id`/`--dockerfile-path`/`--docker-image-file`/`--docker-keep`：Docker 沙箱选项

**依赖**：`click`/`asyncclick`（CLI）、`python-dotenv`（.env）、内部 `Config`/`Agent`/`ConsoleFactory`

---

### 4.2 Agent 核心层 `trae_agent/agent/`

#### `agent.py` — Agent Facade

**文件路径**：`trae_agent/agent/agent.py`

**职责**：薄封装层，将 CLI 与具体 Agent 类解耦。根据 `AgentType` 枚举分发到具体实现，并管理 MCP 清理保证。

**关键类**：

- **`AgentType(Enum)`** — Agent 类型枚举：`TraeAgent = "trae_agent"`
- **`Agent`** — Facade 类
  - `__init__(self, agent_type, agent_config, console_mode=RUN, console_type=SIMPLE, trajectory_file=None, docker_config=None, docker_keep=False)`：实例化 `TrajectoryRecorder`，按 `match AgentType` 构造具体 Agent（目前仅 `TraeAgent`），绑定 `cli_console`
  - `async run(self, task, extra_args) -> AgentExecution`：调用 `agent.new_task(task, extra_args)` → 可选 `initialise_mcp()` → 启动 console 异步任务 → `await agent.execute_task()`（包在 try/finally，始终 `cleanup_mcp_clients()`）→ `await cli_console_task` → 返回 `execution`

#### `agent_basics.py` — 数据模型层

**文件路径**：`trae_agent/agent/agent_basics.py`

**职责**：纯数据层，定义 Agent 执行状态与步骤的数据模型，无行为逻辑。

**关键类型**：

| 类型 | 说明 |
|---|---|
| `AgentStepState(Enum)` | 步骤状态：`THINKING`/`CALLING_TOOL`/`REFLECTING`/`COMPLETED`/`ERROR` |
| `AgentState(Enum)` | 执行状态：`IDLE`/`RUNNING`/`COMPLETED`/`ERROR` |
| `@dataclass AgentStep` | 单步：`step_number`、`state`、`llm_messages`、`llm_response`、`tool_calls`、`tool_results`、`reflection`、`error` |
| `@dataclass AgentExecution` | 整体执行：`agent_state`、`steps: list[AgentStep]`、`total_tokens`、`success`、`final_result`、`execution_time` |
| `@dataclass AgentError` | 错误信息 |

#### `base_agent.py` — 抽象 Agentic 循环

**文件路径**：`trae_agent/agent/base_agent.py`（~14KB）

**职责**：定义通用、可复用的 Agentic 循环与所有 I/O 编排（LLM 调用、工具分发、轨迹、控制台、Docker 启停）。是整个系统的执行引擎。

**关键类 `BaseAgent(ABC)`**：

- **`__init__`**：从 `agent_config` 构建 `LLMClient`（基于 `agent_config.model`）、解析 `max_steps`、`model_config`、初始化工具列表（`_tools`）、可选构建 `DockerManager` 与 `DockerToolExecutor`、初始化 `_tool_caller`（host 用 `ToolExecutor`，Docker 模式用 `DockerToolExecutor` 包装）、调用 `clear_older_ckg()` 清理过期 CKG 数据库
- **核心方法**：
  - `async execute_task(self) -> AgentExecution` — **主循环**：Docker 模式先 `docker_manager.start()`；有界循环（`while step < max_steps`）：创建 `AgentStep(THINKING)` → `await _run_llm_step()` → 完成检查 → 否则 `await _tool_call_handler()` → `await _finalize_step()`（记录轨迹、更新 console、追加步骤；`COMPLETED` 则 break）；异常 → `ERROR`；步数耗尽 → 报告；`finally` Docker 模式 `docker_manager.stop()`；循环后 `close_tools()`、`cleanup_mcp_clients()`
  - `async _run_llm_step(self, step, messages, execution)` — **LLM 调用**：`self._llm_client.chat(messages, model_config, tools)` 单次同步模型调用；累计 token；完成检查（`llm_indicates_task_completed`）；完成则 `_is_task_completed` 校验（`must_patch=="true"` 时要求非空 diff 且排除测试文件）→ `COMPLETED`/返回；否则 `_tool_call_handler`
  - `async _tool_call_handler(self, tool_calls, step)` — **工具分发**：按 `model_config.parallel_tool_calls` 选择 `parallel_tool_call`/`sequential_tool_call`；每个 `ToolResult` 作为 `LLMMessage(role="user", tool_result=...)` 追加到消息
  - `async _finalize_step(self, step, messages, execution)` — 标记 `COMPLETED`、记录轨迹、更新 console、追加步骤；`COMPLETED` 则 break
- **抽象/钩子方法**（由 `TraeAgent` 重写）：
  - `new_task(self, task, extra_args)` — 抽象，初始化任务
  - `cleanup_mcp_clients(self)` — 抽象，清理 MCP
  - `llm_indicates_task_completed(self, llm_response) -> bool` — 钩子，默认 `False`
  - `_is_task_completed(self, ...) -> bool` — 钩子，默认 `True`
  - `task_incomplete_message(self) -> LLMMessage` — 钩子，返回继续提示
  - `reflect_on_result(self, tool_results) -> LLMMessage | None` — 钩子，默认注入工具失败描述

#### `trae_agent.py` — 具体 SWE Agent

**文件路径**：`trae_agent/agent/trae_agent.py`（~10KB）

**职责**：`BaseAgent` 的具体化，面向软件工程任务。定义默认工具列表、系统提示、`task_done` 完成语义、MCP 发现、SWE-bench 风格 patch 处理。

**关键组件**：

- **`TraeAgentToolNames`** — 默认工具名列表：`["bash", "str_replace_based_edit_tool", "sequentialthinking", "task_done"]`
- **`TraeAgent(BaseAgent)`**：
  - `new_task(self, task, extra_args)` — 设置 `_task`；确保 `_tools`（从 registry 取，fallback `TraeAgentToolNames`）；构建 `_initial_messages = [system(TRAE_AGENT_SYSTEM_PROMPT), user(项目根路径 + 问题陈述 + 可选属性)]`；启动轨迹记录
  - `execute_task(self)` — 重写：包 `super().execute_task()`；之后 `finalize_recording(success, final_result)`；若 `patch_path` 设置则写 `get_git_diff()` 到该文件
  - `initialise_mcp(self)` — 发现 MCP 工具，扩展 `self._tools`
  - `discover_mcp_tools(self)` — 按 `allow_mcp_servers` 白名单过滤，连接每个 MCP server，包装为 `MCPTool` 加入工具集
  - `get_git_diff(self) -> str` — `git --no-pager diff` 获取改动
  - `remove_patches_to_tests(diff) -> str` — 过滤测试文件 diff（源自 aider-swe-bench，Apache-2.0）
  - **完成钩子重写**：
    - `llm_indicates_task_completed` — True iff `task_done` in `llm_response.tool_calls`
    - `_is_task_completed` — `must_patch=="true"` 时要求非空且排除测试文件的 diff
    - `task_incomplete_message` — 返回"任务未完成"提示
    - `reflect_on_result` — `None`（依赖 `sequentialthinking` 与模型自身）
  - `cleanup_mcp_clients(self)` — 关闭所有 MCP 客户端

#### `docker_manager.py` — Docker 沙箱管理

**文件路径**：`trae_agent/agent/docker_manager.py`（~11KB）

**职责**：自包含的 Docker 容器生命周期管理与持久 shell 命令执行。通过 `pexpect` 控制 PTY 交互式 shell。

**关键类 `DockerManager`**：

- `__init__(docker_image, docker_container_id, dockerfile_path, docker_image_file, workspace_dir, container_workspace_dir="/workspace")` — 存储配置，`container=None`、`shell=None`
- `start(self)` — 构建/加载/拉取镜像；`docker.containers.create/run`（host workspace bind-mount 到 `/workspace`）；`_copy_tools_to_container()`（`docker cp` 工具目录到 `CONTAINER_TOOLS_PATH`）；`_start_persistent_shell()`（`pexpect.spawn("docker exec -it {id} /bin/bash")`）
- `execute(self, command, timeout=120) -> tuple[int, str]` — 在持久 shell 内执行命令，用 `---CMD_DONE---` 标记协议捕获 exit code + 清理后的 stdout
- `stop(self)` — 关闭 shell；若 managed 容器则 stop+remove
- `_execute_interactive(self, command, timeout)` — 实际执行算法：发送命令 → `echo {marker}$?` → `expect(marker+r"(\d+)")` 解析 exit code → 清理输出（去除命令回显）→ 等待下一提示符

**依赖**：`docker`（Python SDK）、`pexpect`、stdlib `os`/`subprocess`/`uuid`。无内部 trae_agent 导入。

#### `prompt/agent_prompt.py` — 系统提示

**文件路径**：`trae_agent/prompt/agent_prompt.py`

**职责**：定义 `TRAE_AGENT_SYSTEM_PROMPT` 字符串常量，作为每次运行的 `role="system"` 消息。

**提示词要点**：
- **身份**："You are an expert AI software engineering agent."
- **绝对路径规则**（关键约束）：所有 `file_path` 工具参数必须是绝对路径，由用户消息中的 `[Project root path]` + 项目内相对路径组合
- **7 步方法论**：理解问题 → 探索定位 → 复现 Bug（关键步骤）→ 调试诊断 → 实现修复 → 验证测试 → 总结
- **完成协议**："If you are sure the issue has been solved, you should call the `task_done` to finish the task."

---

### 4.3 工具层 `trae_agent/tools/`

#### 工具注册表与基类

**`__init__.py`** — 定义 `tools_registry` 字典，映射工具名 → 工具类：

| 工具名 | 类 |
|---|---|
| `"bash"` | `BashTool` |
| `"str_replace_based_edit_tool"` | `TextEditorTool` |
| `"json_edit_tool"` | `JSONEditTool` |
| `"sequentialthinking"` | `SequentialThinkingTool` |
| `"task_done"` | `TaskDoneTool` |
| `"ckg"` | `CKGTool` |

> `MCPTool` 与 `DockerToolExecutor` 不在 registry：前者运行时按 MCP server 动态创建，后者是 executor 包装而非工具。

**`base.py`** — 定义工具抽象接口与调度器（~7.7KB）：

- **`Tool(ABC)`** — 工具基类
  - 抽象方法：`get_name()`、`get_description()`、`get_parameters() -> list[ToolParameter]`、`async execute(arguments) -> ToolExecResult`
  - `get_input_schema()` — 构建 JSON Schema。**provider 适配**：`openai` 强制所有参数 `required` + 可选参数加 `"null"` 类型 + `additionalProperties: false`（strict mode）；其他 provider 仅 `required=True` 进 `required`
  - `json_definition()` — `{name, description, parameters: get_input_schema()}`
- **数据类**：
  - `ToolParameter` — 参数声明：`name`、`type`、`description`、`enum`、`items`、`required`
  - `ToolCall` — 解析后的 LLM 工具调用：`name`、`call_id`、`arguments`、`id`
  - `ToolExecResult` — 工具执行中间结果：`output`、`error`、`error_code`
  - `ToolResult` — 最终返回给 Agent 的结果：`call_id`、`name`、`success`、`result`、`error`
- **`ToolExecutor`** — 调度器
  - `tools` 属性构建 `{normalized_name: tool}`（`_normalize_name` 小写化 + 去下划线，LLM 可发 `Str_Replace_Based_Edit_Tool` 等）
  - `execute_tool_call(tool_call) -> ToolResult` — 查找、执行、映射（`error_code==0` 为成功）、异常转失败结果
  - `parallel_tool_call(tool_calls)` — `asyncio.gather` 并行
  - `sequential_tool_call(tool_calls)` — 顺序
  - `close_tools()` — 收集所有 `tool.close()`

#### 各内置工具

**`bash_tool.py`** — 持久 bash 会话工具：
- `_BashSession` — 包装长存活 `asyncio` 子进程 shell；`/bin/bash`（Unix，`preexec_fn=os.setsid` 创建进程组）或 `cmd.exe`（Windows）；`_sentinel` 标记检测命令完成与 exit code；`run()` 轮询 stdout buffer
- `BashTool` — 注册名 `"bash"`；参数 `command`（必填）、`restart`（重置会话）；`execute()` 懒启动会话后执行；`close()` 停止会话

**`edit_tool.py`** — `str_replace_based_edit_tool` 文件编辑工具（~17KB）：
- `TextEditorTool` — 注册名 `"str_replace_based_edit_tool"`；子命令 `view`/`create`/`str_replace`/`insert`
- `view`：目录用 `find -maxdepth 2`，文件用 `cat -n` 风格（可选 `view_range` 切片）
- `create`：拒绝覆盖已存在文件
- `str_replace`：核心编辑实现——`old_str` 必须精确唯一匹配（0 → "did not appear"，>1 → 列出匹配行号），替换后返回 `±SNIPPET_LINES`(4) 上下文片段
- `insert`：在指定行后插入
- `validate_path()` 强制绝对路径 + 命令与文件/目录状态校验
- 使用 `trae_agent.tools.run.maybe_truncate` 截断长输出

**`edit_tool_cli.py`** — 独立 CLI 版（Docker 内用）：
- 自包含（内联重定义 `Tool`/`ToolError`/`maybe_truncate`/`run` 等，无 trae_agent 导入）
- `SNIPPET_LINES=5`（库版本 4）
- 添加 `argparse` `main()` 入口，子命令 `view`/`create`/`str_replace`/`insert`
- 打包为容器内 `edit_tool` 可执行文件，由 `DockerToolExecutor` 调用

**`json_edit_tool.py`** — JSONPath JSON 编辑工具（~13KB）：
- `JSONEditTool` — 注册名 `"json_edit_tool"`；操作 `view`/`set`/`add`/`remove`
- 支持 JSONPath 语法：`$`、`.key`、`[index]`、`[*]`、`..key`（递归下降）、`[start:end]`（切片）
- `_load_json_file`/`_save_json_file`（`pretty_print` 控制 `indent=2`）
- `set` 用 `jsonpath_expr.update(data, value)`
- `add` 拆分表达式为 `left`（父）+ `right`（目标）：`Fields` 加键到 dict，`Index` 插入 list
- `remove` 逆序遍历匹配，通过 `match.full_path.left` 定位父节点删除
- 依赖 `jsonpath_ng`

**`json_edit_tool_cli.py`** — 独立 CLI 版，同 `edit_tool_cli.py` 模式，打包为 `json_edit_tool` 容器可执行文件

**`sequential_thinking_tool.py`** — 结构化思考工具（~13KB）：
- `@dataclass ThoughtData` — `thought`、`thought_number`、`total_thoughts`、`next_thought_needed` + 可选 `is_revision`/`revises_thought`/`branch_from_thought`/`branch_id`/`needs_more_thoughts`
- `SequentialThinkingTool` — 注册名 `"sequentialthinking"`；维护 `thought_history` 与 `branches`
- 支持修订与分支，外部化推理步骤，状态跨调用累积

**`task_done_tool.py`** — 任务完成信号工具：
- `TaskDoneTool` — 注册名 `"task_done"`；无参数；`execute()` 总返回 `ToolExecResult(output="Task done.")`；Agent 循环将其调用视为停止条件

**`ckg_tool.py`** — 代码知识图谱查询工具（~8KB）：
- `CKGTool` — 注册名 `"ckg"`；命令 `search_function`/`search_class`/`search_class_method`
- 参数 `command`/`path`（代码库目录）/`identifier`/`print_body`
- 懒构建/加载 `CKGDatabase`（按 codebase 路径缓存），返回文件路径+行范围+可选源码体
- 截断于 `MAX_RESPONSE_LEN`(16000)，附 `<response clipped>` 与隐藏条目数

**`ckg/` 子包** — CKG 引擎：

`ckg/base.py`：
- `@dataclass FunctionEntry` — `name`/`file_path`/`body`/`start_line`/`end_line`/`parent_function`/`parent_class`
- `@dataclass ClassEntry` — `name`/`file_path`/`body`/`fields`/`methods`/`start_line`/`end_line`
- `extension_to_language` — `.py→python`/`.java→java`/`.cpp→cpp`/`.c→c`/`.ts→typescript`/`.js→javascript`

`ckg/ckg_database.py`（核心引擎）：
- `CKGDatabase.__init__(codebase_path)` — 计算 snapshot hash（git 优先 `git status --porcelain`+`HEAD`，否则文件元数据 MD5）；hash 不变则复用现有 SQLite DB，否则删除旧库新建并 `_construct_ckg()` 填充
- 语言 visitor（`_recursive_visit_python/java/cpp/c/typescript/javascript`）—— 递归遍历 tree-sitter AST，抽取 `function_definition`/`class_declaration`/`method_declaration` 等节点为 `FunctionEntry`/`ClassEntry`，附加父类/父函数上下文
- `_construct_ckg()` — glob `**/*`，跳过隐藏文件，按 `extension_to_language` 懒加载 `tree_sitter_languages.get_parser`，解析后分发到匹配 visitor
- `query_function(identifier, entry_type="function"|"class_method")` — `entry_type="function"` 保留 `parent_class IS NULL`，`"class_method"` 保留 `parent_class IS NOT NULL`
- `query_class(identifier)` — 按名查类
- DB 持久于 `LOCAL_STORAGE_PATH/ckg/{hash}.db`，`storage_info.json` 映射 codebase→hash，过期 1 周清理

**`docker_tool_executor.py`** — Docker 沙箱工具执行器：
- `DockerToolExecutor(original_executor, docker_manager, docker_tools, host_workspace_dir, container_workspace_dir)` — 包装 host executor + DockerManager
- `_translate_path(host_path)` — host workspace 路径 → container workspace 路径
- `sequential_tool_call` — 在 `_docker_tools_set` 中的工具走 `_execute_in_docker`，其余委托原 executor
- `parallel_tool_call` — 简化为 sequential（Docker 模式并行降级顺序）
- `_execute_in_docker(tool_call)` — 构建容器内 CLI 命令：`bash` 取 `command` 原样；`str_replace_based_edit_tool` 调 `{CONTAINER_TOOLS_PATH}/edit_tool <sub> --{key} '{val}'`；`json_edit_tool` 类似（`value` JSON 编码）；其他 `NotImplementedError`；经 `docker_manager.execute()` 返回 `(exit_code, output)` 包为 `ToolResult`
- 鸭子类型（非 `ToolExecutor` 子类）

**`mcp_tool.py`** — MCP 工具适配器：
- `MCPTool(client, tool: mcp.types.Tool, model_provider=None)` — 包装 MCP server 工具为 trae-agent `Tool`
- `get_name()`/`get_description()` 返回 MCP 工具原名/描述
- `get_parameters()` — 读 `tool.inputSchema` 构建 `ToolParameter`，按 `required` 列表设置
- `execute(arguments)` — `client.call_tool(name, arguments)`；`isError` → error，否则取 `content[0].text`

**`run.py`** — 共享异步 shell 运行器：
- `maybe_truncate(content, truncate_after=16000)` — 超限截断附 `<response clipped>` 标记
- `async run(cmd, timeout=120.0) -> tuple[returncode, stdout, stderr]` — `asyncio.create_subprocess_shell` + `wait_for`，超时杀进程

---

### 4.4 LLM 客户端层 `trae_agent/utils/llm_clients/`

#### 接口与工厂

**`base_client.py`** — `BaseLLMClient` 抽象基类：
- 抽象方法 `chat(messages, model_config, tools=None, reuse_history=True) -> LLMResponse` —— 唯一 chat 方法
- `set_chat_history`、可选 `supports_tool_calling`
- 持有可选 `TrajectoryRecorder`

**`llm_client.py`** — `LLMClient` 工厂：
- 按 `LLMProvider` 枚举（7 个 provider）懒导入具体客户端
- 委托所有方法到具体客户端

**`llm_basics.py`** — 基础数据类型：
- `LLMResponse`、`LLMMessage`、`LLMUsage`、`LLMProvider` 枚举等

**`retry_utils.py`** — 重试工具：
- `retry_with` 随机退避（3–30s sleep，`max_retries` 来自配置，失败打印 traceback）

#### 共享基类

**`openai_compatible_base.py`** — `OpenAICompatibleClient` + `ProviderConfig` 策略（~10.6KB）：
- 服务 Chat-Completions 风格的 provider（Azure、Doubao、OpenRouter）
- `ProviderConfig` 策略接口：`create_client()`、`get_service_name()`、`get_provider_name()`、`get_extra_headers()`、`supports_tool_calling(model_name)`
- 处理 token 参数选择（`max_completion_tokens` vs `max_tokens`，基于 `ModelConfig.should_use_max_completion_tokens()`）
- 工具 schema 生成、retry 装饰、历史管理、轨迹记录

#### 各 Provider 客户端

| 文件 | Provider | 要点 |
|---|---|---|
| `openai_client.py` | OpenAI | 用 **Responses API**（`client.responses.create`，非 Chat Completions）；唯一捕获 `reasoning_tokens`（o 系列推理模型）；函数工具流；`call_id`+`function_call_output` 存历史 |
| `anthropic_client.py` | Anthropic | 原生 SDK；额外将 `bash`→`ToolBash20250124Param`、`str_replace_based_edit_tool`→`TextEditor20250429` 映射为 Anthropic 一方 server 工具；记录 cache creation/read tokens |
| `google_client.py` | Google Gemini | 原生 `google-genai`；`GenerateContentConfig`；因 Gemini 无 call_id 故 `uuid4` 生成；要求 `ToolResult.name`；`FunctionResponse` |
| `ollama_client.py` | Ollama | 混合：用 `openai.OpenAI` 做类型但调原生 `ollama.chat`；`uuid4` 生成 call_id+id；**无 usage 跟踪**；完全本地模型 |
| `azure_client.py` | Azure | `AzureProvider(ProviderConfig)` + `AzureClient(OpenAICompatibleClient)`；`openai.AzureOpenAI` |
| `doubao_client.py` | Doubao | `DoubaoProvider` + `DoubaoClient`；结构同 OpenRouter |
| `openrouter_client.py` | OpenRouter | `OpenRouterProvider`；env 驱动 header（`OPENROUTER_SITE_URL`→`HTTP-Referer`，`OPENROUTER_SITE_NAME`→`X-Title`）；保守能力检查 |

**架构要点**：
- 所有 `chat` 调用是同步非流式（被同步 `retry_with` 包装）
- 工具调用统一 `Tool`→`ToolCall`/`ToolResult` 模型，各 client 转换为原生 schema 并解析回 `ToolCall`
- `OpenAIClient` **不**继承 `OpenAICompatibleClient`（OpenAI 用新 Responses API，其他用 Chat Completions）

---

### 4.5 配置与工具层 `trae_agent/utils/`

#### `config.py` — YAML 配置加载（~14KB）

**配置 Schema**（YAML，推荐）：

```yaml
agents:
  trae_agent:
    enable_lakeview: true
    model: trae_agent_model      # 引用 models 中的键名
    max_steps: 200
    tools: [bash, str_replace_based_edit_tool, sequentialthinking, task_done]

model_providers:               # provider 定义
  anthropic:
    api_key: your_key
    provider: anthropic
    base_url: https://...      # 可选
  openai:
    api_key: your_key
    provider: openai

models:                        # 模型定义，引用 provider
  trae_agent_model:
    model_provider: anthropic
    model: claude-sonnet-4-20250514
    max_tokens: 4096
    temperature: 0.5
    parallel_tool_calls: true  # 可选

lakeview:                      # Lakeview 模型配置（可选）
  model: lakeview_model         # 引用 models 中的键名

mcp_servers:                   # MCP 服务（可选）
  playwright:
    command: npx
    args: ["@playwright/mcp@0.0.27"]

allow_mcp_servers: [playwright] # MCP 白名单（可选）
```

**关键数据类**：
- `TraeAgentConfig` — `model`、`max_steps`、`tools`、`enable_lakeview` 等；`resolve_config_values` 处理覆盖
- `ModelProviderConfig` — `api_key`、`provider`、`base_url`
- `ModelConfig` — `model_provider`、`model`、`max_tokens`、`temperature`、`parallel_tool_calls`；`should_use_max_completion_tokens()` 判断 token 参数
- `LakeviewConfig` — 引用 model；默认回退主 provider
- `MCPServerConfig` — `command`/`args`/`env`/`cwd`（stdio），SSE/HTTP/websocket 声明但 `NotImplementedError`
- `Config` — `create(config_file=...)`；`resolve_config_values(provider, model, base_url, api_key, max_steps)` 编排覆盖

**配置优先级**：**CLI 参数 > 配置文件 > 环境变量 > 默认值**
- `resolve_config_value(key, cli_arg, env_var, config_value)` 实现此逻辑
- 环境变量：`{PROVIDER_UPPER}_API_KEY`、`{PROVIDER_UPPER}_BASE_URL`

#### `legacy_config.py` — 旧版 JSON 配置兼容

- `LegacyConfig` — 扁平结构：`model_providers`（model+provider 一条记录）、`default_provider`、`max_steps`、`enable_lakeview`、`lakeview_config` 按名引用
- `Config.create_from_legacy_config(path)` 当传入 `.json` 路径时使用

#### `lake_view.py` — Lakeview 步骤摘要（~9KB）

**职责**：对 Agent 每个完成步骤生成简短精炼摘要。

**机制**：
- 控制台异步调用 `LakeView.create_lakeview_step(agent_step)`
- **双 LLM pass**：(1) 任务/细节抽取器；(2) 打标签器
- 使用 lakeview model config（temperature 强制 0.1，`reuse_history=False`）
- 输出 `LakeViewStep`，渲染为 Rich `Panel`：`[emoji tags] The agent <task>. <details>`
- 标签词汇固定 8 个：`WRITE_TEST`/`VERIFY_TEST`/`EXAMINE_CODE`/`WRITE_FIX`/`VERIFY_FIX`/`REPORT`/`THINK`/`OUTLIER`
- 两个提示词均 few-shot，要求 XML 标签输出，正则解析；各最多 10 次重试
- 累积 `self.steps` 文本超 300k 字符则跳过打标签
- 通过 `enable_lakeview`（默认 true）开启，需 `LakeviewConfig.model`

#### `trajectory_recorder.py` — 轨迹记录（~10KB）

**职责**：记录完整执行轨迹用于调试、分析、研究（"研究友好"的核心）。

**输出**：单个 JSON 文件（默认 `trajectories/trajectory_{timestamp}.json`）

**记录内容**：
- 顶层：`task`/`start_time`/`end_time`/`provider`/`model`/`max_steps`/`success`/`final_result`/`execution_time`
- `llm_interactions[]`：`timestamp`/`provider`/`model`/`input_messages`/`response{content, model, finish_reason, usage{input/output/cache_creation/cache_read/reasoning_tokens}, tool_calls[]}`/`tools_available`
- `agent_steps[]`：`step_number`/`timestamp`/`state`/`llm_messages`/`llm_response`/`tool_calls`/`tool_results`/`reflection`/`error`/可选`lakeview_summary`

**特性**：每次 append 后立即保存（增量持久化）；API key 不记录；`trajectories/` 被 git 忽略

**接线**：`BaseLLMClient.set_trajectory_recorder` + Agent 步骤记录调用；每个 LLM client 在有 recorder 时调用 `record_llm_interaction`

#### `mcp_client.py` — MCP 客户端

- `MCPClient` — 单 server 连接；`connect_and_discover` **仅支持 stdio 传输**（从 `MCPServerConfig.command/args/env/cwd` 构建）；SSE/streamable-HTTP/websocket 声明但 `NotImplementedError`
- `AsyncExitStack` 管理 `stdio_client` + `ClientSession` 生命周期；`session.initialize()`
- 发现的工具包装为 `MCPTool`（来自 `trae_agent.tools.mcp_tool`）追加到调用方容器
- `call_tool(name, args)` 转发到 session；`cleanup()` 关闭 stack

#### `cli/` — 控制台 UI

- `cli_console.py` — `CLIConsole` 抽象 + `ConsoleFactory`；`ConsoleMode`(RUN/INTERACTIVE)、`ConsoleType`(SIMPLE/RICH)
- `simple_console.py` — `SimpleCLIConsole`：Rich 表格、后台 Lakeview 任务、最终摘要；RUN 模式默认
- `rich_console.py` — `RichCLIConsole`：Textual TUI 应用 `RichConsoleApp`，含 header/footer、可滚动 `RichLog`、实时 `TokenDisplay` widget、INTERACTIVE 模式 `Input`（`help`/`status`/`clear`/`exit`）
- 两者共享 `generate_agent_step_table` 与 `AGENT_STATE_INFO`，均通过 `set_lakeview` 接入 `LakeView`

#### `constants.py`

```python
LOCAL_STORAGE_PATH = Path.home() / ".trae-agent"
```

---

### 4.6 系统提示词 `trae_agent/prompt/`

见 [4.2 `prompt/agent_prompt.py`](#promptagent_prompt--系统提示)。

---

### 4.7 Server 服务模块 `server/`

**文件路径**：`server/Readme.md`

**状态**：**设计阶段**（仅有设计文档，无 FastAPI 实现代码）。

**设计意图**：提供 HTTP API 包装 Agent，对齐 roadmap 的 SDK/headless 目标。计划支持 `run(..., model=...)` 动态指定模型。当前产品入口仍是 CLI（`trae-cli`/`trae run`/`trae interactive`）。

---

### 4.8 评测系统 `evaluation/`

包含**两套并行系统**：

#### (1) Benchmark 评测流水线

- `run_evaluation.py` + `utils.py` + `setup.sh` —— **SWE-bench 族基准评测**：
  - 构建 Agent 产物 → 每实例在独立 Docker 容器内运行 `trae-cli` → 用上游 harness 评估 patch
  - `ThreadPoolExecutor` 并行
  - `setup.sh` 检查精确 harness commit hash 保证可复现

#### (2) 补丁选择 Agent（研究产物）

`evaluation/patch_selection/` —— **Selector Agent**：基于 Agent 的候选补丁集成方法。
- `selector.py` / `selector_agent.py` / `sandbox.py`：Agent 通过 `pexpect` 驱动的 Docker 沙箱（`Sandbox`）运行工具，对候选 patch 做分组分区 + 可选多数投票
- `analysis.py`：分析结果
- `trae_selector/tools/tools/`：沙箱内工具实现（`bash`/`edit`/`run`/`base`/`execute_bash`/`execute_str_replace_editor`），作为 CLI 脚本在沙箱内调用，打印 `Tool Call Status:` 行
- `ProcessPoolExecutor` 并行
- `example/example.jsonl`：示例输入

---

### 4.9 测试套件 `tests/`

**框架**：`pytest` + `unittest.TestCase`/`IsolatedAsyncioTestCase`；`asyncio_mode="auto"`；`testpaths=["tests"]`

**测试结构**：

| 测试文件 | 覆盖范围 |
|---|---|
| `tests/test_cli.py` | CLI 行为（`CliRunner`，mock Agent/Config）：长 prompt 透传、`--file` 读取、不存在文件错误、task+file 互斥、无输入错误、不存在工作目录错误 |
| `tests/agent/test_trae_agent.py` | `TraeAgent`：任务初始化、`get_git_diff`、`remove_patches_to_tests`、完成检测、工具初始化、受保护属性访问限制 |
| `tests/tools/test_bash_tool.py` | `BashTool`：名称/描述/参数、错误处理、会话重启、echo 成功 |
| `tests/tools/test_edit_tool.py` | `TextEditorTool`：create/insert/str_replace（多匹配错误/成功）、view（目录/文件）、相对路径错误 |
| `tests/tools/test_json_edit_tool.py` | `JSONEditTool`：set/add/remove/view，文件未找到 |
| `tests/tools/test_mcp_tool.py` | `MCPTool`：get_name/description/parameters、execute 成功/失败/异常 |
| `tests/utils/test_config.py` | base_url 传播、Lakeview 默认回退/禁用、MCP server config 解析 |
| `tests/utils/test_google_client.py` | `GoogleClient`（`SKIP_GOOGLE_TEST` 门控）：init/env-key/chat/parse_messages/parse_tool_call_result/supports_tool_calling |
| `tests/utils/test_mcp_client.py` | `MCPClient`：状态/connect/connect_and_discover/无效配置/call_tool/list_tools/cleanup |
| `tests/utils/test_ollama_client_utils.py` | `OllamaClient`（`SKIP_OLLAMA_TEST` 门控）："能跑"烟雾测试 |
| `tests/utils/test_openrouter_client_utils.py` | `OpenRouterClient`（`SKIP_OPENROUTER_TEST` 门控）：烟雾测试 |

**门控**：`make test` 设 `SKIP_OLLAMA_TEST=true SKIP_OPENROUTER_TEST=true SKIP_GOOGLE_TEST=true`，CI 避免实调 API

---

### 4.10 文档 `docs/`

| 文档 | 内容 |
|---|---|
| `docs/tools.md` | 5 个内置工具参考：`str_replace_based_edit_tool`（view/create/str_replace/insert）、`bash`（持久会话/120s 超时/restart）、`sequentialthinking`（思考/修订/分支）、`task_done`（完成信号）、`json_edit_tool`（JSONPath view/set/add/remove） |
| `docs/legacy_config.md` | 旧版 JSON 配置指南（已弃用，指向 YAML）；setup、配置优先级、JSON 结构、3 步迁移路径 |
| `docs/TRAJECTORY_RECORDING.md` | 轨迹记录系统深度规范：组件、客户端/Agent 集成、用法、完整 JSON schema、收益/管理/安全 |
| `docs/roadmap.md` | 路线图（"研究友好 AI Agent 平台"）：SDK 开发、沙箱环境、轨迹分析、工具与 MCP、高级 Agent 流/多 Agent |

---

### 4.11 二进制分发 `trae_agent/dist/`

`trae_agent/dist/dist_tools/` 含两个 PyInstaller 冻结的独立二进制可执行文件（各 ~2.1MB）：
- `edit_tool`（2,129,648 字节）
- `json_edit_tool`（2,129,160 字节）

**用途**：无需本地 Python 环境即可分发/调用 `str_replace_based_edit_tool` 与 `json_edit_tool`。`pyinstaller==6.15.0` 在 `pyproject.toml` 核心依赖中精确锁定。这是工具沙箱交付的第三种方式（另两种：host 进程内 `trae_agent.tools.*`、Selector 沙箱内 `evaluation/patch_selection/.../tools/`）。

---

## 5. 端到端执行流程

```
用户: trae-cli run "Fix the bug in main.py" --provider anthropic --model claude-sonnet-4-20250514
  │
  ▼
[cli.py: run]
  加载 .env + Config.create(trae_config.yaml)
  resolve_config_values(provider=anthropic, model=..., api_key=..., max_steps=...)
  可选: 为 Docker 预构建 PyInstaller 二进制
  解析绝对 working_dir
  构建 task_args (project_path, issue, must_patch, patch_path)
  实例化 Agent(agent_type=TraeAgent, agent_config, console_mode=RUN, ...)
  │
  ▼
[agent.py: Agent.run]
  agent.new_task(task, extra_args)
    ├─ 设置 _task
    ├─ 确保 _tools (从 tools_registry 取, fallback TraeAgentToolNames)
    ├─ _initial_messages = [system(TRAE_AGENT_SYSTEM_PROMPT),
    │                      user([Project root path]:\n{project_path}\n{问题})]
    └─ 启动轨迹记录
  (MCP 允许则) await initialise_mcp() → discover_mcp_tools → 扩展 _tools
  打印任务详情
  启动 console 异步任务
  await agent.execute_task()
  │
  ▼
[base_agent.py: BaseAgent.execute_task]  (TraeAgent.execute_task 包装)
  (Docker 模式) docker_manager.start()
  有界循环 (step < max_steps):
    1. 创建 AgentStep(step_number, THINKING)
    2. await _run_llm_step(step, messages, execution):
       ├─ llm_response = self._llm_client.chat(messages, model_config, tools)
       │   (唯一 LLM 调用; tools 传入以便 provider 发 tool_calls)
       ├─ 累计 token usage
       ├─ 完成检查: TraeAgent.llm_indicates_task_completed
       │   (True iff task_done in tool_calls)
       │   ├─ True → _is_task_completed 校验:
       │   │   must_patch=="true" → 要求非空 remove_patches_to_tests(get_git_diff())
       │   │   ├─ 通过 → COMPLETED, final_result=response.content, success=True, return
       │   │   └─ 不通过 → 追加 task_incomplete_message(), 继续循环
       │   └─ False → await _tool_call_handler(tool_calls, step)
    3. _tool_call_handler:
       ├─ 按 parallel_tool_calls 选 parallel/sequential
       │   (Docker 模式: DockerToolExecutor 路由 bash/edit/json_edit 到容器)
       ├─ 每个 ToolResult 作为 LLMMessage(role="user", tool_result=...) 追加
       └─ (默认) reflect_on_result 注入失败描述 (TraeAgent 重写为 None)
    4. await _finalize_step → COMPLETED, 记录轨迹, 更新 console, append step
       ├─ COMPLETED → break
       ├─ 异常 → ERROR, break
       └─ 步数耗尽 → "exceeded maximum steps"
  finally: (Docker) docker_manager.stop() if not keep
  post: await _close_tools(), set execution_time, cleanup_mcp_clients()
  │
  ▼
[trae_agent.py: TraeAgent.execute_task 收尾]
  finalize_recording(success, final_result)
  (patch_path 设置则) 写 get_git_diff() 到 patch_path
  │
  ▼
[agent.py: Agent.run 收尾]
  await cli_console_task
  return execution
  │
  ▼
[cli.py: run 收尾]
  打印轨迹路径
  (KeyboardInterrupt/异常处理)
```

---

## 6. 依赖关系

### 内部依赖图

```
config.py ←── (legacy) legacy_config.py
    │
    ├──▶ base_client.py, llm_client.py, 各 provider client
    ├──▶ mcp_client.py
    └──▶ cli_console.py (consoles)

llm_basics.py ←── base_client, 各 provider client, lake_view, trajectory_recorder

base_client.py ←── llm_client, 各 provider client

openai_compatible_base.py ←── azure_client, doubao_client, openrouter_client

retry_utils.py ←── 各 provider client

trajectory_recorder.py ←── base_client (及间接 agent)

lake_view.py ←── cli_console / consoles

mcp_client.py ──▶ tools.mcp_tool + config.MCPServerConfig

tools/base.py ── (无内部导入, 自包含抽象)
tools/run.py  ── (无内部导入, 共享工具)
tools/edit_tool.py ──▶ tools/run.py, tools/base
tools/ckg_tool.py ──▶ tools/ckg/ckg_database, tools/run.MAX_RESPONSE_LEN
tools/ckg/ckg_database.py ──▶ tools/ckg/base, utils.constants.LOCAL_STORAGE_PATH
tools/docker_tool_executor.py ──▶ agent.docker_manager, tools/base
tools/mcp_tool.py ──▶ tools/base (相对导入)

agent/base_agent.py ──▶ utils.llm_clients, tools.base, utils.trajectory_recorder,
                        tools.docker_tool_executor, agent.docker_manager,
                        tools.ckg.ckg_database (clear_older_ckg)
agent/trae_agent.py ──▶ agent.base_agent, prompt.agent_prompt, utils.mcp_client,
                        tools.mcp_tool, tools.__init__ (registry)
agent/agent.py ──▶ agent.trae_agent, utils.trajectory_recorder, utils.cli.console
cli.py ──▶ agent.agent, utils.config, utils.cli.console_factory
```

### 外部依赖（`pyproject.toml`）

| 依赖 | 版本 | 用途 |
|---|---|---|
| `openai` | >=1.86.0 | OpenAI/Azure/Doubao/OpenRouter 客户端 |
| `anthropic` | >=0.54.0,<=0.60.0 | Anthropic 客户端 |
| `google-genai` | >=1.24.0 | Google Gemini 客户端 |
| `ollama` | >=0.5.1 | Ollama 本地客户端 |
| `click` / `asyncclick` | >=8.0.0 | CLI 框架 |
| `pydantic` | >=2.0.0 | 数据校验 |
| `rich` | >=13.0.0 | 终端美化 |
| `textual` | >=0.50.0 | Rich TUI 框架 |
| `pyyaml` | >=6.0.2 | YAML 配置 |
| `python-dotenv` | >=1.0.0 | .env 加载 |
| `jsonpath-ng` | >=1.7.0 | JSONPath 解析（json_edit_tool）|
| `tree-sitter` | ==0.21.3 | AST 解析（CKG）|
| `tree-sitter-languages` | ==1.10.2 | 语言 parser |
| `mcp` | ==1.12.2 | Model Context Protocol |
| `pyinstaller` | ==6.15.0 | 二进制冻结 |
| `socksio` | >=1.0.0 | SOCKS 代理支持 |
| `ruff` | >=0.12.4 | Linter |

**可选依赖**：
- `test`：`pytest`/`pytest-asyncio`/`pytest-mock`/`pytest-cov`/`pre-commit`
- `evaluation`：`datasets`/`docker`/`pexpect`/`unidiff`

---

## 7. 项目运行方式

### 安装

```bash
git clone https://github.com/bytedance/trae-agent.git
cd trae-agent
uv sync --all-extras
source .venv/bin/activate
```

### 配置

1. 复制示例配置：
   ```bash
   cp trae_config.yaml.example trae_config.yaml
   ```
2. 编辑 `trae_config.yaml` 填入 API 凭证与偏好（见 [4.5 配置 Schema](#configpy--yaml-配置加载14kb)）

**环境变量替代**：
```bash
export OPENAI_API_KEY="..."
export ANTHROPIC_API_KEY="..."
export GOOGLE_API_KEY="..."
export OPENROUTER_API_KEY="..."
export DOUBAO_API_KEY="..."
```

### 基本命令

```bash
# 一次性任务执行
trae-cli run "Create a hello world Python script"

# 查看配置
trae-cli show-config

# 交互模式
trae-cli interactive

# 指定 provider/model
trae-cli run "Fix the bug in main.py" --provider openai --model gpt-4o
trae-cli run "Add unit tests" --provider anthropic --model claude-sonnet-4-20250514
trae-cli run "Optimize this algorithm" --provider google --model gemini-2.5-flash
trae-cli run "Comment this code" --provider ollama --model qwen3
```

### 高级选项

```bash
# 自定义工作目录
trae-cli run "Add tests" --working-dir /path/to/project

# 保存轨迹
trae-cli run "Debug authentication" --trajectory-file debug_session.json

# 强制生成 patch
trae-cli run "Update API endpoints" --must-patch

# 最大步数
trae-cli interactive --provider openai --model gpt-4o --max-steps 30
```

### Docker 沙箱模式

```bash
# 指定镜像在新容器运行
trae-cli run "Add tests" --docker-image python:3.11

# 挂载目录
trae-cli run "write a script" --docker-image python:3.12 --working-dir test_workdir/

# 附加已有容器
trae-cli run "Update API" --docker-container-id 91998a56056c

# 用 Dockerfile 构建环境
trae-cli run "Debug auth" --dockerfile-path test_workspace/Dockerfile

# 加载本地 tar 镜像
trae-cli run "Fix bug" --docker-image-file test_workspace/trae_agent_custom.tar

# 任务后保留容器 (默认移除)
trae-cli run "Add tests" --docker-image python:3.11 --docker-keep false
```

### 交互模式命令

- 输入任意任务描述执行
- `status` — 显示 Agent 信息
- `help` — 显示可用命令
- `clear` — 清屏
- `exit`/`quit` — 结束会话

### 开发命令（Makefile）

```bash
make lint      # 代码检查 (ruff)
make test      # 运行测试 (设 SKIP_*_TEST=true 跳过实调)
make build     # 构建
```

### 故障排查

- **Import 错误**：`PYTHONPATH=. trae-cli run "your task"`
- **API Key 问题**：`echo $OPENAI_API_KEY` / `trae-cli show-config`
- **命令未找到**：`uv run trae-cli run "your task"`
- **权限错误**：`chmod +x /path/to/project`

---

## 8. 扩展点与设计要点

### Agent 扩展

- **新增 Agent 类型**：实现 `BaseAgent`，重写 `new_task`/`cleanup_mcp_clients` 与完成钩子，加入 `AgentType` 枚举与 `Agent.__init__` 分发
- **完成语义**：重写 `llm_indicates_task_completed`/`_is_task_completed`/`task_incomplete_message`
- **反思行为**：重写 `reflect_on_result`（`TraeAgent` 设为 `None`，依赖 `sequentialthinking`）

### 工具扩展

- **新增内置工具**：实现 `Tool` 子类（`get_name`/`get_description`/`get_parameters`/`execute`），加入 `tools/__init__.py` 的 `tools_registry`
- **工具实例化契约**：`tools_registry[name](model_provider=provider_string)` —— 工具是 provider 感知的
- **provider 适配**：`Tool.get_input_schema()` 集中处理 OpenAI strict mode，个别工具（如 `BashTool`）可自行分支 `model_provider == "openai"`

### LLM Provider 扩展

- **OpenAI 兼容 provider**：实现 `ProviderConfig` 策略 + 继承 `OpenAICompatibleClient`（如 `AzureClient`/`DoubaoClient`）
- **原生 provider**：继承 `BaseLLMClient`，实现 `chat`/`parse_messages`/`parse_tool_call`/`parse_tool_call_result`，加入 `LLMProvider` 枚举与 `LLMClient` 工厂懒导入

### MCP 集成

- 配置 `mcp_servers` + `allow_mcp_servers` 白名单
- `TraeAgent.initialise_mcp()` → `discover_mcp_tools()` 过滤后连接，每个 server 工具包装为 `MCPTool` 加入工具集
- 当前仅 stdio 传输（SSE/HTTP/websocket 声明但未实现）

### Docker 沙箱

- `DockerToolExecutor` 是鸭子类型 executor，包装 host `ToolExecutor` + `DockerManager`
- 沙箱工具（`bash`/`str_replace_based_edit_tool`/`json_edit_tool`）路由到容器内独立 CLI 可执行文件（`edit_tool_cli.py`/`json_edit_tool_cli.py` 打包）
- host workspace bind-mount 到 `/workspace`，路径自动翻译
- 并行调用在 Docker 模式降级为顺序

### CKG（代码知识图谱）

- `clear_older_ckg()` 在每次 `BaseAgent.__init__` 调用，清理过期 DB（1 周）
- DB 持久于 `~/.trae-agent/ckg/{hash}.db`，按 snapshot hash 复用（git 优先，否则文件元数据）
- 支持 6 语言（Python/Java/C++/C/TypeScript/JavaScript），tree-sitter 解析

### 关键设计属性

- **完成语义工具驱动**：`TraeAgent` 用 `task_done` 工具调用判定完成（非文本启发式），系统提示明确指示模型完成后调用 `task_done`，使循环终止确定性
- **SWE-bench 对齐**：`must_patch=true` 时要求非空且排除测试文件的 diff（`remove_patches_to_tests` 源自 aider-swe-bench）
- **非流式**：所有 `chat` 调用同步非流式，被同步 `retry_with` 包装
- **增量轨迹持久化**：每次 append 后立即保存，非仅结束时
- **双配置格式**：YAML（推荐）+ 旧版 JSON（`LegacyConfig` 兼容），统一经 `Config` 加载
- **名称间接引用**：YAML 中 `agents.trae_agent.model` 是 `models` map 的键，每个 model 引用 `model_provider`；`lakeview` 是独立模型
- **精确锁定可复现**：`uv.lock` + `pyinstaller==6.15.0`/`mcp==1.12.2`/`tree-sitter==0.21.3` 等精确版本

---

> **文档生成说明**：本文档基于仓库 commit `e839e559ac61bdd0e057c375dd1dee391fee797d` 的源码分析生成。如仓库后续演进，部分细节可能变化，请以最新源码为准。
