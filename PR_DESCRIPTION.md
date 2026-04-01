- Add extensions/qqbot with full channel implementation
- Support text, image, audio, video, file message types
- Include WebSocket gateway, proactive messaging, session management
- Add onboarding wizard and configuration
- Add docs/channels/qqbot.md documentation
- Update docs.json navigation and labeler.yml

## Summary

- **Problem:** OpenClaw does not support QQ Bot as a messaging channel, limiting reach for users on QQ (one of the largest messaging platforms in China).
- **Why it matters:** Adding QQ Bot support enables OpenClaw users to deploy AI assistants on QQ, covering a significant user base.
- **What changed:** Added a new `extensions/qqbot` channel plugin with WebSocket gateway, message handling (text/image/audio/video/file), proactive messaging, session management, onboarding wizard, docs, and labeler config.
- **What did NOT change (scope boundary):** No changes to core OpenClaw logic, existing channels, or shared infrastructure. This is a self-contained extension addition.

## Change Type (select all)

- [x] Feature
- [x] Docs

## Scope (select all touched areas)

- [x] Integrations
- [x] UI / DX
- [x] CI/CD / infra

## Linked Issue/PR

N/A

## User-visible / Behavior Changes

- New channel `qqbot` available in `openclaw onboard` channel selection.
- New config keys: `channels.qqbot.appId`, `channels.qqbot.token`, `channels.qqbot.appSecret`.
- QQ Bot channel appears in `openclaw channels status`.

## Security Impact (required)

- New permissions/capabilities? `Yes` — new channel receives/sends messages via QQ Bot API.
- Secrets/tokens handling changed? `Yes` — stores QQ Bot appId, token, appSecret in openclaw config.
- New/changed network calls? `Yes` — WebSocket connection to QQ Bot gateway; HTTP calls to QQ Bot REST API.
- Command/tool execution surface changed? `No`
- Data access scope changed? `No`
- If any `Yes`, explain risk + mitigation: Credentials are stored via the standard openclaw config mechanism (same as all other channels). Network calls are limited to official QQ Bot API endpoints. No new command execution surface is introduced.

## Repro + Verification

### Environment

- OS: macOS (darwin)
- Runtime/container: Node 22.22.1
- Model/provider: Any (channel-agnostic)
- Integration/channel: QQ Bot
- Relevant config: `channels.qqbot.appId`, `channels.qqbot.token`, `channels.qqbot.appSecret`

### Steps

1. `pnpm install && pnpm build`
2. `pnpm test -- extensions/qqbot/index.test.ts`
3. `pnpm openclaw onboard` — select QQ Bot channel, provide credentials.

### Expected

- Build passes without qqbot-related errors.
- 2 unit tests pass.
- QQ Bot appears as a selectable channel in onboarding.

### Actual

- All as expected.

## Evidence

- [x] Failing test/log before + passing after

`pnpm test -- extensions/qqbot/index.test.ts` — 2 tests passed (plugin entry loads, channel type is correct).
`pnpm build` — no qqbot-related errors or MISSING_EXPORT warnings.
`pnpm check` — no qqbot-related lint/type errors after format fix.

## Human Verification (required)

- Verified scenarios: build, unit tests, `pnpm check`, `onboard --help` runs successfully.
- Edge cases checked: removed redundant `@types/ws` devDependency (root already has it); fixed `docs.json` truncation.
- What you did **not** verify: live QQ Bot connection with real credentials (no QQ Bot account available).

## Review Conversations

- [x] I replied to or resolved every bot review conversation I addressed in this PR.
- [x] I left unresolved only the conversations that still need reviewer or maintainer judgment.

## Compatibility / Migration

- Backward compatible? `Yes`
- Config/env changes? `Yes` — new optional config keys under `channels.qqbot.*`
- Migration needed? `No`

## Failure Recovery (if this breaks)

- How to disable/revert this change quickly: Remove `extensions/qqbot/` directory; revert `docs.json`, `labeler.yml`, and `pnpm-lock.yaml` changes.
- Files/config to restore: `.github/labeler.yml`, `docs/docs.json`, `pnpm-lock.yaml`
- Known bad symptoms reviewers should watch for: Build failures mentioning qqbot, missing qqbot dependencies at runtime.

## Risks and Mitigations

- Risk: QQ Bot API changes could break the extension.
  - Mitigation: Extension is self-contained; API types are defined locally in `src/types.ts`; can be updated independently without affecting other channels.
