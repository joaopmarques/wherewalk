# Panels never import src/ui

Panels compose sign parts only. They have no `className`, no `style`, and no `@/ui` imports, and lint enforces this. A redesign is planned. With this rule it touches only `src/ui/` and `src/components/sign/`, and no Panel. The cost is a few thin wrappers, such as `SignButton`. Keep the rule, even where a wrapper looks like extra code.
