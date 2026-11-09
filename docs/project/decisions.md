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

## 2026-11-08: Upgrade all dependencies and require Node 22.13

The user explicitly selected Node >=22.13 rather than retaining Node 20 compatibility. Upgrade all nine direct dependencies to the registry's latest stable releases, adapt default exports for Chalk/update-notifier, and use ESLint 10 flat configuration. Keep the public command syntax and processor behavior unchanged.

Apply patched glob/minimatch overrides because the latest direct development dependencies still resolved versions with advisories. Verify the entire suite against the new tree and check the minimum runtime separately. The functional correction matrix in docs/audits/implementation-and-cli.md remains a proposal.

## 2026-11-08: Implement the accepted audit corrections

The user approved the correction plan for all 18 findings. Keep the dependency update as the baseline and implement behavior with explicit overwrite permission, reliable partial results and one shared configuration contract. Use the existing checkout on `fix/cli-audit` to retain pending edits and the SFTP save workflow; no commits or release actions were requested.

`--in-place` updates only the same input name/format automatically. Name/format changes produce siblings. Reject effective output/in-place combinations and cross-input rename chains even with overwrite permission, so queued work cannot read an earlier output in place of its original input. Separate output directories or separate commands can express those chains.

Retain legacy internal adapters while documenting the CLI as the public interface. Custom presets still replace built-in definitions completely. Null means unspecified; boolean negations provide explicit overrides. Alloy platform/group policies are resolved before entering the processor and carried into each planned write.

Require explicit launcher and portrait orientation on every relevant Android activity before removing landscape variants. Conflicting or missing Android configuration keeps resources. Launcher references alone do not establish that legacy splash/icon files are unused, so those files are retained.

Run legacy suites inside an exclusive temporary project copy. Cleanup scripts preserve user outputs/configuration. Expand flat test selectors in the runner to support Node 22.13 without relying on newer glob APIs. Keep unit/integration scripts as aliases until the suite is actually split.

## 2026-11-08: Commit the reviewed work and exclude root screenshots

After the verified implementation handoff, the user explicitly authorized semantic commits and session documentation. Group tooling/dependencies, processing corrections, contextual completion and documentation separately. Keep root screenshots matching `*-.png` outside the index and unchanged. This authorization covers committing; pushing, tagging, version changes and publication remain separate decisions.

## 2026-11-08: Establish the official user manual

The user requested structured official documentation and chose English to match the repository. Make `docs/README.md` the central index and `docs/guide/` the maintained chapters. Keep the root README as the project entry point and retain its useful anchors; make CUSTOM_PRESETS.md a compatibility navigation page instead of a second independent configuration reference.

Ship the public index and chapters in npm through explicit file-list patterns. Keep internal project/session/audit documents out of that public manual tree. State that the guide follows source and that the published npm executable can lag behind unreleased checkout changes. Verify command examples against the current executable and compare the flag reference with Commander rather than relying on older prose.

## 2026-11-08: Release 4.0.0 through trusted publishing

The user confirmed a major release because the Node minimum, overwrite policy, null inheritance and error statuses change public compatibility. Keep documented legacy aliases and compatibility shims; the version bump does not silently remove them.

Replace local manual publication with a tag-triggered OIDC workflow matching TiTools/AISkills. Put the workflow on main first, let the package owner register the exact trusted publisher with their own 2FA, then push the approved version tag. The user explicitly authorized main alignment by fast-forward and the publication/session-note pushes. This flow needs neither an NPM_TOKEN secret nor a local npm session.

Treat workflow success and registry availability separately. npm accepted this first trusted publication before 4.0.0 and latest became visible. Confirm registry metadata, provenance, source commit and downloaded tarball integrity before reporting completion. Keep root screenshots outside Git and package artifacts.
