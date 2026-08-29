# Syngo Architecture Conventions

These rules apply to all code written during the rebuild (Phase 0 onward).
Pre-existing code under `src/components/`, `src/services/`, `src/hooks/`,
`src/store/` is migrated into this structure feature by feature, not all
at once.

## Folder structure

    src/
      features/
        <feature>/
          components/   # UI local to this feature
          hooks/         # React hooks local to this feature
          service.ts     # Firestore/network calls for this feature
          store.ts       # Zustand store for this feature, if it has one
          types.ts       # Types local to this feature
          index.ts       # Public surface — only this file is imported
                         # from outside the feature
      components/
        common/          # Shared, feature-agnostic UI (buttons, cards,
                         # loading/error states)
      lib/                # Shared non-UI logic (motion primitives, date
                         # helpers, code generators, Firestore converters)
      theme/              # Unistyles tokens, themes, breakpoints
      config/             # Firebase init, fonts, app-wide config
      types/               # Cross-feature shared types only

## Import rules

- A feature's internals (`components/`, `hooks/`, `service.ts`, etc.) are
  never imported directly from another feature or from `app/`. Only
  `src/features/<feature>/index.ts` is a valid import path from outside
  the feature.
- `src/lib` and `src/components/common` may be imported from anywhere.
- `app/` (expo-router routes) may import from any feature's `index.ts`
  and from `src/lib`, `src/components/common`, `src/theme`, `src/config`.
- No feature imports another feature's internals to "borrow" a component
  or hook. If two features need the same thing, it belongs in
  `src/lib` or `src/components/common`.

## Rationale

This exists so a reviewer can look at an import path and immediately know
whether it's crossing a feature boundary it shouldn't. It also means a
feature can be deleted or rewritten by deleting/rewriting one folder,
without hunting for scattered files across `components/`, `services/`,
and `hooks/`.
