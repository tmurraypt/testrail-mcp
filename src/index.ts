#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { apiGet, apiPost } from "./client.js";

const server = new McpServer({
  name: "testrail",
  version: "1.0.0",
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function err(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return { content: [{ type: "text" as const, text: `Error: ${msg}` }], isError: true };
}

function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

// ─── Projects ───────────────────────────────────────────────────────────────

server.tool(
  "get_projects",
  "List all TestRail projects",
  { is_completed: z.number().optional().describe("1 to return completed projects only, 0 for active") },
  async ({ is_completed }) => {
    try {
      return ok(await apiGet("get_projects", { is_completed }));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "get_project",
  "Get a specific TestRail project",
  { project_id: z.number().describe("Project ID") },
  async ({ project_id }) => {
    try {
      return ok(await apiGet(`get_project/${project_id}`));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "add_project",
  "Create a new TestRail project",
  {
    name: z.string().describe("Project name"),
    announcement: z.string().optional().describe("Project description/announcement"),
    show_announcement: z.boolean().optional().describe("Show announcement on project overview"),
    suite_mode: z.number().optional().describe("1=single suite, 2=single+baselines, 3=multiple suites"),
  },
  async (args) => {
    try {
      return ok(await apiPost("add_project", stripUndefined(args)));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "update_project",
  "Update an existing TestRail project",
  {
    project_id: z.number().describe("Project ID"),
    name: z.string().optional().describe("Project name"),
    announcement: z.string().optional(),
    show_announcement: z.boolean().optional(),
    is_completed: z.boolean().optional(),
  },
  async ({ project_id, ...body }) => {
    try {
      return ok(await apiPost(`update_project/${project_id}`, stripUndefined(body)));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "delete_project",
  "Delete a TestRail project (irreversible)",
  { project_id: z.number().describe("Project ID") },
  async ({ project_id }) => {
    try {
      return ok(await apiPost(`delete_project/${project_id}`));
    } catch (e) { return err(e); }
  }
);

// ─── Suites ─────────────────────────────────────────────────────────────────

server.tool(
  "get_suites",
  "List test suites for a project",
  { project_id: z.number().describe("Project ID") },
  async ({ project_id }) => {
    try {
      return ok(await apiGet(`get_suites/${project_id}`));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "get_suite",
  "Get a specific test suite",
  { suite_id: z.number().describe("Suite ID") },
  async ({ suite_id }) => {
    try {
      return ok(await apiGet(`get_suite/${suite_id}`));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "add_suite",
  "Create a new test suite",
  {
    project_id: z.number().describe("Project ID"),
    name: z.string().describe("Suite name"),
    description: z.string().optional(),
  },
  async ({ project_id, ...body }) => {
    try {
      return ok(await apiPost(`add_suite/${project_id}`, stripUndefined(body)));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "update_suite",
  "Update a test suite",
  {
    suite_id: z.number().describe("Suite ID"),
    name: z.string().optional(),
    description: z.string().optional(),
  },
  async ({ suite_id, ...body }) => {
    try {
      return ok(await apiPost(`update_suite/${suite_id}`, stripUndefined(body)));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "delete_suite",
  "Delete a test suite (irreversible)",
  { suite_id: z.number().describe("Suite ID") },
  async ({ suite_id }) => {
    try {
      return ok(await apiPost(`delete_suite/${suite_id}`));
    } catch (e) { return err(e); }
  }
);

// ─── Sections ───────────────────────────────────────────────────────────────

server.tool(
  "get_sections",
  "List sections in a project (optionally filtered by suite)",
  {
    project_id: z.number().describe("Project ID"),
    suite_id: z.number().optional().describe("Suite ID (required for multi-suite projects)"),
  },
  async ({ project_id, suite_id }) => {
    try {
      return ok(await apiGet(`get_sections/${project_id}`, { suite_id }));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "get_section",
  "Get a specific section",
  { section_id: z.number().describe("Section ID") },
  async ({ section_id }) => {
    try {
      return ok(await apiGet(`get_section/${section_id}`));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "add_section",
  "Create a new section",
  {
    project_id: z.number().describe("Project ID"),
    name: z.string().describe("Section name"),
    description: z.string().optional(),
    suite_id: z.number().optional().describe("Suite ID (required for multi-suite projects)"),
    parent_id: z.number().optional().describe("Parent section ID for nesting"),
  },
  async ({ project_id, ...body }) => {
    try {
      return ok(await apiPost(`add_section/${project_id}`, stripUndefined(body)));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "update_section",
  "Update a section",
  {
    section_id: z.number().describe("Section ID"),
    name: z.string().optional(),
    description: z.string().optional(),
  },
  async ({ section_id, ...body }) => {
    try {
      return ok(await apiPost(`update_section/${section_id}`, stripUndefined(body)));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "delete_section",
  "Delete a section (irreversible)",
  { section_id: z.number().describe("Section ID") },
  async ({ section_id }) => {
    try {
      return ok(await apiPost(`delete_section/${section_id}`));
    } catch (e) { return err(e); }
  }
);

// ─── Cases ──────────────────────────────────────────────────────────────────

server.tool(
  "get_cases",
  "List test cases for a project with optional filters",
  {
    project_id: z.number().describe("Project ID"),
    suite_id: z.number().optional().describe("Suite ID"),
    section_id: z.number().optional().describe("Section ID"),
    priority_id: z.string().optional().describe("Comma-separated priority IDs"),
    type_id: z.string().optional().describe("Comma-separated type IDs"),
    milestone_id: z.number().optional().describe("Milestone ID"),
    created_after: z.number().optional().describe("Unix timestamp"),
    created_before: z.number().optional().describe("Unix timestamp"),
    updated_after: z.number().optional().describe("Unix timestamp"),
    updated_before: z.number().optional().describe("Unix timestamp"),
    limit: z.number().optional().describe("Max results (1-250)"),
    offset: z.number().optional().describe("Number of records to skip"),
  },
  async ({ project_id, ...params }) => {
    try {
      return ok(await apiGet(`get_cases/${project_id}`, params as Record<string, string | number | undefined>));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "get_case",
  "Get a specific test case",
  { case_id: z.number().describe("Case ID") },
  async ({ case_id }) => {
    try {
      return ok(await apiGet(`get_case/${case_id}`));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "add_case",
  "Create a new test case in a section",
  {
    section_id: z.number().describe("Section ID to add the case to"),
    title: z.string().describe("Test case title"),
    template_id: z.number().optional(),
    type_id: z.number().optional(),
    priority_id: z.number().optional(),
    estimate: z.string().optional().describe("Time estimate, e.g. '30s', '1m 45s'"),
    milestone_id: z.number().optional(),
    refs: z.string().optional().describe("Comma-separated reference IDs"),
    custom_preconds: z.string().optional().describe("Preconditions"),
    custom_steps: z.string().optional().describe("Test steps (text format)"),
    custom_expected: z.string().optional().describe("Expected result (text format)"),
    custom_steps_separated: z.array(z.object({
      content: z.string().describe("Step description"),
      expected: z.string().optional().describe("Expected result for this step"),
    })).optional().describe("Separated test steps"),
  },
  async ({ section_id, ...body }) => {
    try {
      return ok(await apiPost(`add_case/${section_id}`, stripUndefined(body)));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "update_case",
  "Update a test case",
  {
    case_id: z.number().describe("Case ID"),
    title: z.string().optional(),
    template_id: z.number().optional(),
    type_id: z.number().optional(),
    priority_id: z.number().optional(),
    estimate: z.string().optional(),
    milestone_id: z.number().optional(),
    refs: z.string().optional(),
    custom_preconds: z.string().optional(),
    custom_steps: z.string().optional(),
    custom_expected: z.string().optional(),
    custom_steps_separated: z.array(z.object({
      content: z.string(),
      expected: z.string().optional(),
    })).optional(),
  },
  async ({ case_id, ...body }) => {
    try {
      return ok(await apiPost(`update_case/${case_id}`, stripUndefined(body)));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "delete_case",
  "Delete a test case (irreversible)",
  { case_id: z.number().describe("Case ID") },
  async ({ case_id }) => {
    try {
      return ok(await apiPost(`delete_case/${case_id}`));
    } catch (e) { return err(e); }
  }
);

// ─── Runs ───────────────────────────────────────────────────────────────────

server.tool(
  "get_runs",
  "List test runs for a project",
  {
    project_id: z.number().describe("Project ID"),
    created_after: z.number().optional().describe("Unix timestamp"),
    created_before: z.number().optional().describe("Unix timestamp"),
    created_by: z.string().optional().describe("Comma-separated user IDs"),
    is_completed: z.number().optional().describe("1=completed, 0=active"),
    milestone_id: z.string().optional().describe("Comma-separated milestone IDs"),
    suite_id: z.string().optional().describe("Comma-separated suite IDs"),
    limit: z.number().optional(),
    offset: z.number().optional(),
  },
  async ({ project_id, ...params }) => {
    try {
      return ok(await apiGet(`get_runs/${project_id}`, params as Record<string, string | number | undefined>));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "get_run",
  "Get a specific test run",
  { run_id: z.number().describe("Run ID") },
  async ({ run_id }) => {
    try {
      return ok(await apiGet(`get_run/${run_id}`));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "add_run",
  "Create a new test run",
  {
    project_id: z.number().describe("Project ID"),
    suite_id: z.number().optional().describe("Suite ID (required for multi-suite projects)"),
    name: z.string().describe("Run name"),
    description: z.string().optional(),
    milestone_id: z.number().optional(),
    assignedto_id: z.number().optional().describe("User ID to assign the run to"),
    include_all: z.boolean().optional().describe("True to include all cases, false to use case_ids"),
    case_ids: z.array(z.number()).optional().describe("Array of case IDs (when include_all=false)"),
    refs: z.string().optional(),
  },
  async ({ project_id, ...body }) => {
    try {
      return ok(await apiPost(`add_run/${project_id}`, stripUndefined(body)));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "update_run",
  "Update a test run",
  {
    run_id: z.number().describe("Run ID"),
    name: z.string().optional(),
    description: z.string().optional(),
    milestone_id: z.number().optional(),
    include_all: z.boolean().optional(),
    case_ids: z.array(z.number()).optional(),
  },
  async ({ run_id, ...body }) => {
    try {
      return ok(await apiPost(`update_run/${run_id}`, stripUndefined(body)));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "close_run",
  "Close a test run (no further changes allowed after closing)",
  { run_id: z.number().describe("Run ID") },
  async ({ run_id }) => {
    try {
      return ok(await apiPost(`close_run/${run_id}`));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "delete_run",
  "Delete a test run (irreversible)",
  { run_id: z.number().describe("Run ID") },
  async ({ run_id }) => {
    try {
      return ok(await apiPost(`delete_run/${run_id}`));
    } catch (e) { return err(e); }
  }
);

// ─── Tests ──────────────────────────────────────────────────────────────────

server.tool(
  "get_tests",
  "List tests in a run",
  {
    run_id: z.number().describe("Run ID"),
    status_id: z.string().optional().describe("Comma-separated status IDs to filter by"),
  },
  async ({ run_id, status_id }) => {
    try {
      return ok(await apiGet(`get_tests/${run_id}`, { status_id }));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "get_test",
  "Get a specific test",
  { test_id: z.number().describe("Test ID") },
  async ({ test_id }) => {
    try {
      return ok(await apiGet(`get_test/${test_id}`));
    } catch (e) { return err(e); }
  }
);

// ─── Results ────────────────────────────────────────────────────────────────

server.tool(
  "get_results",
  "Get results for a specific test",
  {
    test_id: z.number().describe("Test ID"),
    limit: z.number().optional(),
    offset: z.number().optional(),
    status_id: z.string().optional().describe("Comma-separated status IDs"),
  },
  async ({ test_id, ...params }) => {
    try {
      return ok(await apiGet(`get_results/${test_id}`, params as Record<string, string | number | undefined>));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "get_results_for_case",
  "Get results for a specific test case in a run",
  {
    run_id: z.number().describe("Run ID"),
    case_id: z.number().describe("Case ID"),
    limit: z.number().optional(),
    offset: z.number().optional(),
    status_id: z.string().optional(),
  },
  async ({ run_id, case_id, ...params }) => {
    try {
      return ok(await apiGet(`get_results_for_case/${run_id}/${case_id}`, params as Record<string, string | number | undefined>));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "get_results_for_run",
  "Get all results for a test run",
  {
    run_id: z.number().describe("Run ID"),
    created_after: z.number().optional(),
    created_before: z.number().optional(),
    created_by: z.string().optional(),
    status_id: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  },
  async ({ run_id, ...params }) => {
    try {
      return ok(await apiGet(`get_results_for_run/${run_id}`, params as Record<string, string | number | undefined>));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "add_result",
  "Add a test result to a test",
  {
    test_id: z.number().describe("Test ID"),
    status_id: z.number().describe("1=Passed, 2=Blocked, 4=Retest, 5=Failed"),
    comment: z.string().optional(),
    version: z.string().optional(),
    elapsed: z.string().optional().describe("Time spent, e.g. '30s', '1m 45s'"),
    defects: z.string().optional().describe("Comma-separated defect IDs"),
    assignedto_id: z.number().optional(),
  },
  async ({ test_id, ...body }) => {
    try {
      return ok(await apiPost(`add_result/${test_id}`, stripUndefined(body)));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "add_result_for_case",
  "Add a test result for a case in a run",
  {
    run_id: z.number().describe("Run ID"),
    case_id: z.number().describe("Case ID"),
    status_id: z.number().describe("1=Passed, 2=Blocked, 4=Retest, 5=Failed"),
    comment: z.string().optional(),
    version: z.string().optional(),
    elapsed: z.string().optional(),
    defects: z.string().optional(),
    assignedto_id: z.number().optional(),
  },
  async ({ run_id, case_id, ...body }) => {
    try {
      return ok(await apiPost(`add_result_for_case/${run_id}/${case_id}`, stripUndefined(body)));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "add_results_for_cases",
  "Add multiple test results for cases in a run (bulk)",
  {
    run_id: z.number().describe("Run ID"),
    results: z.array(z.object({
      case_id: z.number().describe("Case ID"),
      status_id: z.number().describe("1=Passed, 2=Blocked, 4=Retest, 5=Failed"),
      comment: z.string().optional(),
      version: z.string().optional(),
      elapsed: z.string().optional(),
      defects: z.string().optional(),
      assignedto_id: z.number().optional(),
    })).describe("Array of result objects"),
  },
  async ({ run_id, results }) => {
    try {
      return ok(await apiPost(`add_results_for_cases/${run_id}`, { results }));
    } catch (e) { return err(e); }
  }
);

// ─── Milestones ─────────────────────────────────────────────────────────────

server.tool(
  "get_milestones",
  "List milestones for a project",
  {
    project_id: z.number().describe("Project ID"),
    is_completed: z.number().optional().describe("1=completed, 0=active"),
    is_started: z.number().optional().describe("1=started, 0=not started"),
  },
  async ({ project_id, ...params }) => {
    try {
      return ok(await apiGet(`get_milestones/${project_id}`, params as Record<string, string | number | undefined>));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "get_milestone",
  "Get a specific milestone",
  { milestone_id: z.number().describe("Milestone ID") },
  async ({ milestone_id }) => {
    try {
      return ok(await apiGet(`get_milestone/${milestone_id}`));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "add_milestone",
  "Create a new milestone",
  {
    project_id: z.number().describe("Project ID"),
    name: z.string().describe("Milestone name"),
    description: z.string().optional(),
    due_on: z.number().optional().describe("Due date as Unix timestamp"),
    parent_id: z.number().optional().describe("Parent milestone ID for sub-milestones"),
    start_on: z.number().optional().describe("Start date as Unix timestamp"),
  },
  async ({ project_id, ...body }) => {
    try {
      return ok(await apiPost(`add_milestone/${project_id}`, stripUndefined(body)));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "update_milestone",
  "Update a milestone",
  {
    milestone_id: z.number().describe("Milestone ID"),
    name: z.string().optional(),
    description: z.string().optional(),
    due_on: z.number().optional(),
    parent_id: z.number().optional(),
    start_on: z.number().optional(),
    is_completed: z.boolean().optional(),
    is_started: z.boolean().optional(),
  },
  async ({ milestone_id, ...body }) => {
    try {
      return ok(await apiPost(`update_milestone/${milestone_id}`, stripUndefined(body)));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "delete_milestone",
  "Delete a milestone (irreversible)",
  { milestone_id: z.number().describe("Milestone ID") },
  async ({ milestone_id }) => {
    try {
      return ok(await apiPost(`delete_milestone/${milestone_id}`));
    } catch (e) { return err(e); }
  }
);

// ─── Plans ──────────────────────────────────────────────────────────────────

server.tool(
  "get_plans",
  "List test plans for a project",
  {
    project_id: z.number().describe("Project ID"),
    created_after: z.number().optional(),
    created_before: z.number().optional(),
    created_by: z.string().optional(),
    is_completed: z.number().optional(),
    milestone_id: z.number().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  },
  async ({ project_id, ...params }) => {
    try {
      return ok(await apiGet(`get_plans/${project_id}`, params as Record<string, string | number | undefined>));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "get_plan",
  "Get a specific test plan (includes plan entries and runs)",
  { plan_id: z.number().describe("Plan ID") },
  async ({ plan_id }) => {
    try {
      return ok(await apiGet(`get_plan/${plan_id}`));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "add_plan",
  "Create a new test plan",
  {
    project_id: z.number().describe("Project ID"),
    name: z.string().describe("Plan name"),
    description: z.string().optional(),
    milestone_id: z.number().optional(),
    entries: z.array(z.object({
      suite_id: z.number().describe("Suite ID"),
      name: z.string().optional(),
      description: z.string().optional(),
      assignedto_id: z.number().optional(),
      include_all: z.boolean().optional(),
      case_ids: z.array(z.number()).optional(),
      config_ids: z.array(z.number()).optional(),
    })).optional().describe("Plan entries (test suite configurations)"),
  },
  async ({ project_id, ...body }) => {
    try {
      return ok(await apiPost(`add_plan/${project_id}`, stripUndefined(body)));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "add_plan_entry",
  "Add a new entry (suite configuration) to a test plan",
  {
    plan_id: z.number().describe("Plan ID"),
    suite_id: z.number().describe("Suite ID"),
    name: z.string().optional(),
    description: z.string().optional(),
    assignedto_id: z.number().optional(),
    include_all: z.boolean().optional(),
    case_ids: z.array(z.number()).optional(),
    config_ids: z.array(z.number()).optional(),
  },
  async ({ plan_id, ...body }) => {
    try {
      return ok(await apiPost(`add_plan_entry/${plan_id}`, stripUndefined(body)));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "update_plan",
  "Update a test plan",
  {
    plan_id: z.number().describe("Plan ID"),
    name: z.string().optional(),
    description: z.string().optional(),
    milestone_id: z.number().optional(),
  },
  async ({ plan_id, ...body }) => {
    try {
      return ok(await apiPost(`update_plan/${plan_id}`, stripUndefined(body)));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "close_plan",
  "Close a test plan (no further changes allowed after closing)",
  { plan_id: z.number().describe("Plan ID") },
  async ({ plan_id }) => {
    try {
      return ok(await apiPost(`close_plan/${plan_id}`));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "delete_plan",
  "Delete a test plan (irreversible)",
  { plan_id: z.number().describe("Plan ID") },
  async ({ plan_id }) => {
    try {
      return ok(await apiPost(`delete_plan/${plan_id}`));
    } catch (e) { return err(e); }
  }
);

// ─── Users ──────────────────────────────────────────────────────────────────

server.tool(
  "get_users",
  "List all users (admins) or users for a project (non-admins)",
  { project_id: z.number().optional().describe("Project ID (required for non-admin users)") },
  async ({ project_id }) => {
    try {
      const endpoint = project_id ? `get_users/${project_id}` : "get_users";
      return ok(await apiGet(endpoint));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "get_user",
  "Get a specific user",
  { user_id: z.number().describe("User ID") },
  async ({ user_id }) => {
    try {
      return ok(await apiGet(`get_user/${user_id}`));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "get_user_by_email",
  "Look up a user by email address",
  { email: z.string().describe("Email address") },
  async ({ email }) => {
    try {
      return ok(await apiGet("get_user_by_email", { email }));
    } catch (e) { return err(e); }
  }
);

// ─── Metadata / Auxiliary ───────────────────────────────────────────────────

server.tool(
  "get_statuses",
  "Get available test statuses (passed, failed, etc.)",
  {},
  async () => {
    try {
      return ok(await apiGet("get_statuses"));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "get_case_fields",
  "Get available case fields (system and custom)",
  {},
  async () => {
    try {
      return ok(await apiGet("get_case_fields"));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "get_case_types",
  "Get available case types",
  {},
  async () => {
    try {
      return ok(await apiGet("get_case_types"));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "get_priorities",
  "Get available priority levels",
  {},
  async () => {
    try {
      return ok(await apiGet("get_priorities"));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "get_result_fields",
  "Get available result fields",
  {},
  async () => {
    try {
      return ok(await apiGet("get_result_fields"));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "get_templates",
  "Get available case templates for a project",
  { project_id: z.number().describe("Project ID") },
  async ({ project_id }) => {
    try {
      return ok(await apiGet(`get_templates/${project_id}`));
    } catch (e) { return err(e); }
  }
);

server.tool(
  "get_configs",
  "Get test configurations for a project",
  { project_id: z.number().describe("Project ID") },
  async ({ project_id }) => {
    try {
      return ok(await apiGet(`get_configs/${project_id}`));
    } catch (e) { return err(e); }
  }
);

// ─── Case History ───────────────────────────────────────────────────────────

server.tool(
  "get_case_history",
  "Get the change history for a test case",
  { case_id: z.number().describe("Case ID") },
  async ({ case_id }) => {
    try {
      return ok(await apiGet(`get_history_for_case/${case_id}`));
    } catch (e) { return err(e); }
  }
);

// ─── Start server ───────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TestRail MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
