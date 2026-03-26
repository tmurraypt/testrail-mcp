# testrail-mcp

An MCP (Model Context Protocol) server that connects Claude Desktop to the [TestRail](https://www.testrail.com/) REST API. Manage your test projects, suites, cases, runs, results, and more — directly from Claude.

## Installation

### Claude Desktop

Add this to your Claude Desktop config file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "testrail": {
      "command": "npx",
      "args": ["-y", "testrail-mcp"],
      "env": {
        "TESTRAIL_URL": "https://yourinstance.testrail.io",
        "TESTRAIL_EMAIL": "your@email.com",
        "TESTRAIL_API_KEY": "your-api-key"
      }
    }
  }
}
```

Replace the three `env` values with your own credentials, then restart Claude Desktop.

### Getting a TestRail API Key

1. Log in to your TestRail instance
2. Go to **My Settings** (click your name in the top-right)
3. Go to the **API Keys** tab
4. Click **Add Key**, give it a name, and copy the generated key

## Available Tools

### Projects
`get_projects` · `get_project` · `add_project` · `update_project` · `delete_project`

### Suites
`get_suites` · `get_suite` · `add_suite` · `update_suite` · `delete_suite`

### Sections
`get_sections` · `get_section` · `add_section` · `update_section` · `delete_section`

### Cases
`get_cases` · `get_case` · `add_case` · `update_case` · `delete_case` · `get_case_history`

### Runs
`get_runs` · `get_run` · `add_run` · `update_run` · `close_run` · `delete_run`

### Tests & Results
`get_tests` · `get_test` · `get_results` · `get_results_for_case` · `get_results_for_run` · `add_result` · `add_result_for_case` · `add_results_for_cases`

### Plans
`get_plans` · `get_plan` · `add_plan` · `add_plan_entry` · `update_plan` · `close_plan` · `delete_plan`

### Milestones
`get_milestones` · `get_milestone` · `add_milestone` · `update_milestone` · `delete_milestone`

### Users
`get_users` · `get_user` · `get_user_by_email`

### Metadata
`get_statuses` · `get_case_fields` · `get_case_types` · `get_priorities` · `get_result_fields` · `get_templates` · `get_configs`

## Development

```bash
npm install
npm run build
```

To test with the MCP Inspector:

```bash
npm run inspector
```

## License

MIT
