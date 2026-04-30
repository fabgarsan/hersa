# MCP Servers

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/) is an open standard that enables Claude Code to connect to external tools and data sources. MCP servers extend Claude's capabilities by providing access to APIs, databases, and services like Linear, GitHub, and more.

## Overview

MCP servers allow Claude to:

- **Access external data** - Read from APIs, databases, and services
- **Perform actions** - Create issues, send messages, update records
- **Extend capabilities** - Add custom tools and integrations
- **Maintain context** - Keep relevant information accessible during conversations

## Configuration Scopes

MCP servers can be configured at two different scopes:

| Scope    | Configuration File   | Use When                                                 |
| -------- | -------------------- | -------------------------------------------------------- |
| `local`  | `.claude/mcp.json`   | Project-specific integrations with different credentials |
| `global` | `~/.claude/mcp.json` | Same service/credentials across all projects             |

## Basic Commands

```bash
# Add an MCP server
claude mcp add <server-name> [options]

# List all configured MCP servers
claude mcp list

# View specific server configuration
claude mcp get <server-name>

# Remove an MCP server
claude mcp remove <server-name>

# Remove with specific scope
claude mcp remove <server-name> --scope local
```

---

## Linear

[Linear](https://linear.app) is a modern issue tracking and project management tool. The Linear MCP server enables Claude to interact directly with Linear's API to manage issues, projects, teams, and more.

### Setup

1. **Navigate to Linear Settings**:
   - Go to [linear.app](https://linear.app) → your profile icon → Settings → Security & Access

2. **Create a New API Key**:
   - Click "Personal API keys" → "Create new API key"
   - Give it a descriptive name like "Claude Code Integration"
   - Set an expiration date (recommended: 1 year)

3. **Copy the Token**:
   - Copy the generated token immediately (it won't be shown again)
   - The token format looks like: `lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

4. **Run the setup command** in your terminal:

   ```bash
   claude mcp add linear-server https://mcp.linear.app/mcp \
     --transport http \
     --header "Authorization: Bearer YOUR_LINEAR_API_TOKEN"
   ```

5. **Verify the connection**: `claude mcp list`

6. **Start using Linear**:
   - Try asking "Show me my Linear issues"
   - Use `/start-task <issue-id>` to begin work on an issue
   - Use `/create-task` to create a new issue

### Resources

- [Linear API Documentation](https://developers.linear.app/docs/graphql/working-with-the-graphql-api)
- [Linear MCP Server](https://linear.app/docs/mcp)
- [Claude Code MCP Guide](https://docs.anthropic.com/en/docs/claude-code/mcp)
