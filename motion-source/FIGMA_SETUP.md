# Figma MCP setup

## Status: installed ✅ · authorization ⏳ (needs the founder, once)

- **Plugin.** `figma@claude-plugins-official` **2.2.120**, from the marketplace `anthropics/claude-plugins-official`.
  Installed at user scope and enabled. It is persisted for future sessions through the repo's `.claude/settings.json`.
- **MCP server.** Remote HTTP endpoint `https://mcp.figma.com/mcp` (Figma's official server).
- **Tools exposed once authorized:**
  - `get_design_context`, `get_screenshot`, `get_metadata`, `get_variable_defs`, `search_design_system`,
    `get_libraries`;
  - `use_figma`, `generate_figma_design`, `create_new_file`, `upload_assets`;
  - Code Connect tools;
  - `whoami`.
- **Skills shipped with the plugin:**
  - `figma-use-motion` / `figma-implement-motion` (motion specs ↔ code);
  - `figma-use`, `figma-design-to-code`, `figma-generate-design`, `figma-generate-library`, `figma-code-connect`;
  - `figma-shaders`, `figma-create-new-file`, `figma-use-figjam`, `figma-use-slides`, etc.

## The one manual step: OAuth (only the account owner can do it)
**Local Claude Code (terminal / desktop):**
1. Run `/plugin`.
2. Open **Installed**, then select **figma**.
3. Choose **start authorization**. A browser window opens on figma.com.
4. Click **Allow access**.
5. Return to Claude Code.
6. Run `/plugin` again and confirm that figma shows **Connected**.

**Claude Code on the web / this cloud session:** connectors are attached per account.
1. Open https://claude.ai/customize/connectors.
2. Add or connect **Figma** and approve the OAuth.
3. Start a **new** session on this repo. Connectors attach at session start.

## Prospectify Figma file
**None found, and none invented.**
- No Figma URL or file key appears in the repo, on prospectify.net or in its production bundle.
- If a design file for the app or the brand exists, share its URL: `https://www.figma.com/design/<fileKey>/…`.
- After OAuth, `get_variable_defs` / `get_design_context` can then confirm the tokens against
  `brand/BRAND_SOURCE.md`, and `get_screenshot` can export real in-app frames into `ui/`.
