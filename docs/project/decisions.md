# Decisions

## 2026-11-08: Document the active v3 handlers

Use the current command handlers as the reference for supported syntax and behavior. Older preset routes and internal generators remain in the codebase, so reading defaults or historical release notes alone can imply features the public CLI does not expose.

Record functional discrepancies in README's known limitations and session status. This documentation task does not change image-processing behavior to match old promises.

## 2026-11-08: Apply Humanizer to maintained prose

Use plain, neutral language for documentation and terminal output. Remove repeated conclusions, decorative emphasis, unnecessary capitals, and inflated wording. Preserve commands, snippets, technical claims, and quoted historical messages.

## 2026-11-08: Ship linked guides with the package

Include custom presets, changelog, test/fixture guides, and LICENSE in npm's file list so README links have corresponding package files. Keep the existing version; publishing a release is a separate task.

## 2026-11-08: Keep session state in docs/project

Store requirements, context, decisions, and current status in four fixed files. Import the stable three from CLAUDE.md. Read status.md on demand so session updates do not alter startup context.

Consolidate the pre-existing untracked Claude memory note into context.md, preserving the explicit prohibition on subagent commits.
