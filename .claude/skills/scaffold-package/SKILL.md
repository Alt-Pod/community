---
name: scaffold-package
description: Scaffold a new @community package in the monorepo
argument-hint: [package-name]
---

# Scaffold a New Package

Create a new package named `$0` at `packages/$0/`.

## Files to Create

### `packages/$0/package.json`
```json
{
  "name": "@community/$0",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "@community/shared": "*"
  },
  "devDependencies": {
    "typescript": "^5.9.3"
  }
}
```

### `packages/$0/tsconfig.json`
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

### `packages/$0/src/index.ts`
Barrel export file — export everything from the package.

## After Creating Files

1. Add `"@community/$0": "*"` to any consuming package's dependencies
2. Add `"@community/$0"` to `transpilePackages` in `apps/web/next.config.ts`
3. Add path mappings to `apps/web/tsconfig.json`:
   ```json
   "@community/$0": ["../../packages/$0/src"],
   "@community/$0/*": ["../../packages/$0/src/*"]
   ```
4. Run `yarn install`
