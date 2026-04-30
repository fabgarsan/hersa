# Linear MCP Setup

**Note:** If the Linear MCP tools are not available, help the user install them:

- See docs here: `documentation/setup/mcp.md`
- TL;DR - create a Linear API key and run this command:

```bash
claude mcp add linear-server https://mcp.linear.app/mcp \
  --transport http \
  --header "Authorization: Bearer YOUR_LINEAR_API_TOKEN"
```

- Verify connection with `claude mcp list`
