# Playwright Setup Notes
These apply and were tested on Ubuntu Linut 25.10

# Installation

We need Chromium and Playwright CLI installed and a configuration file for Playwright

```bash
sudo apt install -y chromium-browser
npm install -g @playwright/cli@latest

mkdir "$HOME/.playwright"
cat > "$HOME/.playwright/cli.config.json" << EOF
{
  "browser": {
    "launchOptions": {
      "executablePath": "/usr/bin/chromium-browser"
    }
  }
}
EOF
```
Test this with the following command:

```bash
playwright-cli  open example.com
```

# Configuration OpenCode MCP

Update the `/home/sbaramov/.config/opencode/opencode.jsonc` by adding the following MCP server: 

```json5
    "playwright": {
      "enabled": true,
      "type": "local",
      "command": [ "npx", "-y", "@playwright/mcp@latest", "--isolated",  "--config", "/home/sbaramov/.playwright/cli.config.json"],

    }
```

Complete example: 

```json5
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ollama",
      "options": {
        "baseURL": "http://localhost:11434/v1"
      },
      "models": {
        "qwen3-coder-next:cloud": {
          "name": "qwen3-coder-next:cloud"
        },
        "glm-5.1:cloud": {
          "name": "glm-5.1:cloud"
        },
        "gemma4:31b-cloud": {
          "name": "gemma4:31b-cloud"
        },
        "kimi-k2.5:cloud": {
          "name": "kimi-k2.5:cloud"
        },
        "minimax-m2.7:cloud": {
          "name": "minimax-m2.7:cloud"
        },
        "deepseek-v4-flash:cloud": {
          "name": "deepseek-v4-flash:cloud"
        }
      }
    }
  },
  // https://opencode.ai/docs/permissions/#available-permissions
  "permission": {
    "*": "allow",
    "bash": {
      "*": "allow",
      "git push *": "ask",
      "git rm *": "ask",
      "rm *": "ask"

    },
    "external_directory": "ask"
  },
  "plugin": [
    "@zenobius/opencode-skillful@latest", // Lazy Skill Loading https://github.com/zenobi-us/opencode-skillful
    "@tarquinen/opencode-dcp@latest", // Dynamic Context Pruning https://github.com/Opencode-DCP/opencode-dynamic-context-pruning
    "@mohak34/opencode-notifier@latest"  // Notifier on Complete tasks https://github.com/mohak34/opencode-notifier
  ],
  "mcp": {
    "IntelliJ IDEA": {
      "enabled": true,
      "type": "remote",
      "url": "http://127.0.0.1:64342/sse",
      "headers": {}
    },
    "angular-cli": {
      "enabled": true,
      "type": "local",
      "command": ["npx", "-y", "@angular/cli", "mcp"]
    },
    "tavily-remote-mcp": {
      "enabled": true,
      "type": "remote",
      "url": "https://mcp.tavily.com/mcp/",
      "headers": {
        "Authorization": "Bearer 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"
      }
    },
    "playwright": {
      "enabled": true,
      "type": "local",
      "command": [ "npx", "-y", "@playwright/mcp@latest", "--isolated",  "--config", "/home/sbaramov/.playwright/cli.config.json"],

    }
  }
}
```
