# Windows Product Shell Plan

## Architecture

Add a small product boundary instead of spreading brand decisions through upstream
modules:

- `src/product/config` for shared product identity and feature flags.
- `src/renderer/src/product` for product-only pages and components.
- Narrow integration changes at Electron startup, routing, navigation, settings,
  empty conversation, and packaging configuration.

The existing chat and settings services remain authoritative. Product UI navigates
to those implementations rather than duplicating them.

## Delivery stages

1. Establish and verify the unmodified DeepChat baseline.
2. Add centralized branding and Windows product identity.
3. Add the desktop home experience.
4. Simplify navigation and settings with feature flags.
5. Improve the new-conversation experience.
6. Validate and correct Windows packaging and runtime behavior.
7. Configure `upstream` for DeepChat and publish the project repository.

## Verification strategy

Each stage runs the narrowest relevant checks plus lint and typecheck. Renderer or
Electron changes also run a production build. Windows identity changes conclude
with a packaged x64 application and installer smoke test.

## Risk controls

- Do not rename internal protocols, database tables, provider IDs, or compatibility
  fields.
- Keep the official update mechanism disabled in the branded shell until a Kainice
  release feed exists.
- Prefer additive product components and small entry-point changes.
- Keep feature-flag false values UI-only.
- Preserve a fallback to legacy DeepChat user data.

