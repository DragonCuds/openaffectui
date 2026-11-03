# ui-kit

Shared components for the accsess and Diddash panels. Plan and phases: `/var/www/accsess/docs/tasks/ui-kit.md`.

- `src/ui/` components, `src/styles/ui.css` their styles, `src/showcase/` the `/kit` page (inside each panel, behind its login).
- No dependencies of its own. Each panel resolves it as `@kit` (vite alias + tsconfig paths) and supplies react and lucide-react.
- Colours come from each panel's own tokens. Per-panel knobs: `--meter-fill`, `--meter-opacity`, `--info`.
- Rules: Persian + RTL, dark and light, reduced motion, keyboard, mobile; no 1px borders; free affectUI code only with its MIT notice, Pro items written from scratch.
