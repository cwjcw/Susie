# Windows Product Shell

## Summary

Create a Kainice AI Windows desktop product shell on top of DeepChat while preserving
the existing chat, provider, Ollama, MCP, Skill, ACP, storage, and cross-platform
implementations.

## Goals

- Centralize user-facing product identity in a product configuration layer.
- Ship a distinct home experience and a useful empty-conversation state.
- Simplify primary navigation for ordinary desktop users.
- Hide advanced features through reversible feature flags.
- Produce a working Windows x64 installer with branded application identity.
- Preserve existing user data and maintain a low-conflict path for upstream merges.

## Non-goals

- Reimplementing chat, providers, model management, MCP, Skill, or ACP.
- Changing message, provider, session, MCP, Skill, or ACP data structures.
- Adding accounts, cloud services, licensing, RAG, workflows, or multi-agent systems.
- Upgrading Electron, Vue, Vite, pnpm, Node, or other core dependencies.
- Removing advanced features from the codebase.

## Product identity

The initial configuration is:

- App name: Kainice AI
- Short name: Kainice AI
- Company: Kainice
- Description: Local-first AI desktop assistant

The configuration must also expose website, support URL, copyright, logo, icon,
Windows app ID, and executable name. Product code should consume this configuration
instead of duplicating display strings.

## User experience

- The primary navigation exposes Home, Conversations, Models, Local Models, and
  Settings.
- The home page contains a product introduction, a new-chat action, shortcuts, and
  recent conversations.
- A new empty conversation presents four prompt shortcuts: summarize, write,
  analyze a file, and free chat.
- MCP, Skill, ACP, and developer entries are hidden by default but remain reachable
  when their feature flags are enabled.
- Existing light and dark themes remain supported.

## Compatibility

- Existing database schemas and internal DeepChat identifiers remain unchanged.
- A branded app must detect and continue using an existing DeepChat user-data
  directory when no Kainice AI data directory exists, avoiding silent data loss.
- New installations use the branded product identity and data directory.
- macOS and Linux behavior must not be intentionally broken.

## Windows acceptance criteria

- Development startup opens the desktop window successfully.
- Production build passes.
- Windows x64 packaging produces an installer and unpacked application.
- The application, window, taskbar, tray, installer, shortcuts, and uninstall entry
  use Kainice AI identity.
- Single-instance behavior, tray behavior, persistence, providers, Ollama, model
  configuration, file upload, and chat remain backed by existing DeepChat code.
- Lint, typecheck, applicable tests, build, and packaging checks are recorded.

