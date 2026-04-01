---
<<<<<<< HEAD
summary: "QQ Bot overview, features, and configuration"
read_when:
  - You want to connect a QQ Bot
  - You are configuring the QQ Bot channel
=======
summary: "QQ Bot setup, config, and usage"
read_when:
  - You want to connect OpenClaw to QQ
  - You need QQ Bot credential setup
  - You want QQ Bot group or private chat support
>>>>>>> upstream/main
title: QQ Bot
---

# QQ Bot

<<<<<<< HEAD
QQ Bot connects OpenClaw to QQ (the popular Chinese messaging platform) via the official QQ Bot API. It supports private chats, group chats, media messages, and streaming replies.

---

## Bundled plugin

QQ Bot ships bundled with current OpenClaw releases, so no separate plugin install
is required.

If you are using an older build or a custom install that does not include bundled
QQ Bot, install it manually:

```bash
openclaw plugins install @openclaw/qqbot
```

---

## Quickstart

There are two ways to add the QQ Bot channel:

### Method 1: onboarding (recommended)

If you just installed OpenClaw, run onboarding:

```bash
openclaw onboard
```

The wizard guides you through:

1. Collecting AppID and ClientSecret from the QQ Open Platform
2. Configuring credentials in OpenClaw
3. Starting the gateway

After configuration, check gateway status:

- `openclaw gateway status`
- `openclaw logs --follow`

### Method 2: CLI setup

If you already completed initial install, add the channel via CLI:

```bash
openclaw channels add
```

Choose **QQ Bot**, then enter the AppID and ClientSecret.

After configuration, manage the gateway:

- `openclaw gateway status`
- `openclaw gateway restart`
- `openclaw logs --follow`

---

## Step 1: Create a QQ Bot application

### 1. Open QQ Open Platform

Visit [QQ Open Platform](https://q.qq.com/) and sign in.

### 2. Create a bot application

1. Click **Create Bot** (创建机器人)
2. Fill in the bot name and description
3. Choose a bot avatar

### 3. Copy credentials

From the application's **Development Settings** (开发设置), copy:

- **AppID** (for example: `102146862`)
- **ClientSecret**

Important: keep the ClientSecret private.

### 4. Configure sandbox members

During testing, add sandbox members in **Development Settings** > **Sandbox Configuration** (沙箱配置):

1. Add test users who will interact with the bot
2. Sandbox members can use the bot before it is published

### 5. Publish the bot

Once testing is complete:

1. Submit the bot for review
2. Wait for approval
3. After approval, the bot is live for all users

---

## Step 2: Configure OpenClaw

### Configure with the wizard (recommended)

```bash
openclaw channels add
```

Choose **QQ Bot** and paste your AppID and ClientSecret.

### Configure via config file

Edit `~/.openclaw/openclaw.json`:
=======
QQ Bot connects to OpenClaw via the official QQ Bot API (WebSocket gateway). The
plugin supports C2C private chat, group @messages, and guild channel messages with
rich media (images, voice, video, files).

Status: bundled channel plugin. Direct messages, group chats, guild channels, and
media are supported. Reactions and threads are not supported.

## Bundled with OpenClaw

Current OpenClaw installs bundle QQ Bot. You do not need a separate
`openclaw plugins install` step for normal setup.

## Setup

1. Go to the [QQ Open Platform](https://q.qq.com/) and scan the QR code with your
   phone QQ to register / log in.
2. Click **Create Bot** to create a new QQ bot.
3. Find **AppID** and **AppSecret** on the bot's settings page and copy them.

> AppSecret is not stored in plaintext — if you leave the page without saving it,
> you'll have to regenerate a new one.

4. Add the channel:

```bash
openclaw channels add --channel qqbot --token "AppID:AppSecret"
```

5. Restart the Gateway.

Interactive setup paths:

```bash
openclaw channels add
openclaw configure --section channels
```

## Configure

Minimal config:
>>>>>>> upstream/main

```json5
{
  channels: {
    qqbot: {
      enabled: true,
<<<<<<< HEAD
      appId: "102146862",
      clientSecret: "xxx",
      allowFrom: ["*"],
=======
      appId: "YOUR_APP_ID",
      clientSecret: "YOUR_APP_SECRET",
>>>>>>> upstream/main
    },
  },
}
```

<<<<<<< HEAD
### Configure via environment variables

```bash
export QQBOT_APP_ID="102146862"
export QQBOT_CLIENT_SECRET="xxx"
```

---

## Step 3: Start and test

### 1. Start the gateway

```bash
openclaw gateway
```

### 2. Send a test message

In QQ, find your bot and send a message.

### 3. Approve pairing

By default, the bot replies with a pairing code. Approve it:

```bash
openclaw pairing approve qqbot <CODE>
```

After approval, you can chat normally.

---

## Overview

- **QQ Bot channel**: QQ Bot managed by the gateway
- **Deterministic routing**: replies always return to QQ
- **Session isolation**: private chats and group chats are isolated
- **WebSocket connection**: persistent connection via QQ Bot API

---

## Access control

### Direct messages

- **Default**: `dmPolicy: "pairing"` (unknown users get a pairing code)
- **Approve pairing**:

  ```bash
  openclaw pairing list qqbot
  openclaw pairing approve qqbot <CODE>
  ```

- **Allowlist mode**: set `channels.qqbot.allowFrom` with allowed user OpenIDs

### Group chats

QQ Bot responds to @mentions in groups by default. Configure group behavior via `groupPolicy`.

---

## Configuration examples

### Allow all users (default)
=======
Default-account env vars:

- `QQBOT_APP_ID`
- `QQBOT_CLIENT_SECRET`

File-backed AppSecret:
>>>>>>> upstream/main

```json5
{
  channels: {
    qqbot: {
<<<<<<< HEAD
      allowFrom: ["*"],
=======
      enabled: true,
      appId: "YOUR_APP_ID",
      clientSecretFile: "/path/to/qqbot-secret.txt",
>>>>>>> upstream/main
    },
  },
}
```

<<<<<<< HEAD
### Restrict to specific users

```json5
{
  channels: {
    qqbot: {
      allowFrom: ["USER_OPENID_1", "USER_OPENID_2"],
    },
  },
}
```

### Multiple accounts
=======
Notes:

- Env fallback applies to the default QQ Bot account only.
- `openclaw channels add --channel qqbot --token-file ...` provides the
  AppSecret only; the AppID must already be set in config or `QQBOT_APP_ID`.
- `clientSecret` also accepts SecretRef input, not just a plaintext string.

### Multi-account setup

Run multiple QQ bots under a single OpenClaw instance:
>>>>>>> upstream/main

```json5
{
  channels: {
    qqbot: {
<<<<<<< HEAD
      accounts: {
        main: {
          appId: "102146862",
          clientSecret: "xxx",
        },
        backup: {
          appId: "102146863",
          clientSecret: "yyy",
          enabled: false,
=======
      enabled: true,
      appId: "111111111",
      clientSecret: "secret-of-bot-1",
      accounts: {
        bot2: {
          enabled: true,
          appId: "222222222",
          clientSecret: "secret-of-bot-2",
>>>>>>> upstream/main
        },
      },
    },
  },
}
```

<<<<<<< HEAD
---

## Image server

QQ Bot requires images to be accessible via a public URL. Configure the image server base URL:

```json5
{
  channels: {
    qqbot: {
      imageServerBaseUrl: "http://your-server-ip:18765",
    },
  },
}
```

Or via environment variable:

```bash
export QQBOT_IMAGE_SERVER_BASE_URL="http://your-server-ip:18765"
```

---

## Markdown support

QQ Bot supports Markdown-formatted messages by default. To disable:
=======
Each account launches its own WebSocket connection and maintains an independent
token cache (isolated by `appId`).

Add a second bot via CLI:

```bash
openclaw channels add --channel qqbot --account bot2 --token "222222222:secret-of-bot-2"
```

### Voice (STT / TTS)

STT and TTS support two-level configuration with priority fallback:

| Setting | Plugin-specific      | Framework fallback            |
| ------- | -------------------- | ----------------------------- |
| STT     | `channels.qqbot.stt` | `tools.media.audio.models[0]` |
| TTS     | `channels.qqbot.tts` | `messages.tts`                |
>>>>>>> upstream/main

```json5
{
  channels: {
    qqbot: {
<<<<<<< HEAD
      markdownSupport: false,
    },
  },
}
```

---

## Audio format policy

QQ Bot uses SILK audio format. Configure format conversion behavior:

```json5
{
  channels: {
    qqbot: {
      audioFormatPolicy: {
        // Formats your STT service accepts directly (skip SILK to WAV conversion)
        sttDirectFormats: [".silk", ".wav", ".mp3"],
        // Formats QQ accepts directly (skip to SILK conversion)
        uploadDirectFormats: [".wav", ".mp3", ".silk"],
=======
      stt: {
        provider: "your-provider",
        model: "your-stt-model",
      },
      tts: {
        provider: "your-provider",
        model: "your-tts-model",
        voice: "your-voice",
>>>>>>> upstream/main
      },
    },
  },
}
```

<<<<<<< HEAD
---

## Common commands

| Command   | Description       |
| --------- | ----------------- |
| `/status` | Show bot status   |
| `/reset`  | Reset the session |
| `/model`  | Show/switch model |

## Gateway management commands

| Command                    | Description                   |
| -------------------------- | ----------------------------- |
| `openclaw gateway status`  | Show gateway status           |
| `openclaw gateway install` | Install/start gateway service |
| `openclaw gateway stop`    | Stop gateway service          |
| `openclaw gateway restart` | Restart gateway service       |
| `openclaw logs --follow`   | Tail gateway logs             |

---

## Troubleshooting

### Bot does not respond

1. Ensure the bot is published or the user is a sandbox member
2. Check logs: `openclaw logs --follow`
3. Ensure the gateway is running: `openclaw gateway status`

### Bot does not receive messages

1. Ensure AppID and ClientSecret are correct
2. Ensure the bot application is active on QQ Open Platform
3. Check WebSocket connection logs

### Media send failures

1. Ensure `imageServerBaseUrl` is configured and accessible
2. Ensure the server is reachable from QQ's servers (public IP required)
3. Check logs for detailed errors

---

## Supported message types

### Receive

- Text
- Images
- Audio/voice
- Files

### Send

- Text
- Images
- Audio/voice (SILK format)
- Markdown (when enabled)

---

## Configuration reference

Full configuration: [Gateway configuration](/gateway/configuration)

Key options:

| Setting                                     | Description                    | Default     |
| ------------------------------------------- | ------------------------------ | ----------- |
| `channels.qqbot.enabled`                    | Enable/disable channel         | `true`      |
| `channels.qqbot.appId`                      | QQ Bot AppID                   | -           |
| `channels.qqbot.clientSecret`               | QQ Bot ClientSecret            | -           |
| `channels.qqbot.clientSecretFile`           | Path to file containing secret | -           |
| `channels.qqbot.dmPolicy`                   | DM policy                      | `"pairing"` |
| `channels.qqbot.allowFrom`                  | DM allowlist (OpenID list)     | -           |
| `channels.qqbot.imageServerBaseUrl`         | Public URL for image server    | -           |
| `channels.qqbot.markdownSupport`            | Enable Markdown messages       | `true`      |
| `channels.qqbot.audioFormatPolicy`          | Audio format conversion config | -           |
| `channels.qqbot.accounts.<id>.appId`        | Per-account AppID              | -           |
| `channels.qqbot.accounts.<id>.clientSecret` | Per-account ClientSecret       | -           |

---

## dmPolicy reference

| Value         | Behavior                                                        |
| ------------- | --------------------------------------------------------------- |
| `"pairing"`   | **Default.** Unknown users get a pairing code; must be approved |
| `"allowlist"` | Only users in `allowFrom` can chat                              |
| `"open"`      | Allow all users (requires `"*"` in allowFrom)                   |
=======
Set `enabled: false` on either to disable.

Outbound audio upload/transcode behavior can also be tuned with
`channels.qqbot.audioFormatPolicy`:

- `sttDirectFormats`
- `uploadDirectFormats`
- `transcodeEnabled`

## Target formats

| Format                     | Description        |
| -------------------------- | ------------------ |
| `qqbot:c2c:OPENID`         | Private chat (C2C) |
| `qqbot:group:GROUP_OPENID` | Group chat         |
| `qqbot:channel:CHANNEL_ID` | Guild channel      |

> Each bot has its own set of user OpenIDs. An OpenID received by Bot A **cannot**
> be used to send messages via Bot B.

## Slash commands

Built-in commands intercepted before the AI queue:

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `/bot-ping`    | Latency test                         |
| `/bot-version` | Show the OpenClaw framework version  |
| `/bot-help`    | List all commands                    |
| `/bot-upgrade` | Show the QQBot upgrade guide link    |
| `/bot-logs`    | Export recent gateway logs as a file |

Append `?` to any command for usage help (for example `/bot-upgrade ?`).

## Troubleshooting

- **Bot replies "gone to Mars":** credentials not configured or Gateway not started.
- **No inbound messages:** verify `appId` and `clientSecret` are correct, and the
  bot is enabled on the QQ Open Platform.
- **Setup with `--token-file` still shows unconfigured:** `--token-file` only sets
  the AppSecret. You still need `appId` in config or `QQBOT_APP_ID`.
- **Proactive messages not arriving:** QQ may intercept bot-initiated messages if
  the user hasn't interacted recently.
- **Voice not transcribed:** ensure STT is configured and the provider is reachable.
>>>>>>> upstream/main
