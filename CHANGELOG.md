# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

Log of unreleased changes.

### Added

- Added `destroyLayout()` method. Now users can remove Riccio layout.
- Added `destroyLayout()` documentation in `README.md`.

### Changed

- Riccio `clickHandler()` listener has been moved to `document.body`.
- `clickHandler()` logic has been changed to met the new listener location.

## v1.1.0

Released on **2017/10/05**.

### Added

- UMD support.
- Added `getInstance()`, `isInitialized()` functions.
- Added `buildLayout()` function. This function is called on init and when a
media query is triggered.

### Changed

- Improved Gulp tasks.
- Refactor test folder.

### Deprecated

- Deprecated `getStore()` function. To get an initialized Riccio instance use
`getInstance()`.
- Deprecated `Riccio.prototype.needs()`, `Riccio.prototype.setRows()` and
`Riccio.prototype.setItems()` in favor of `Riccio.prototype.buildLayout()`.

### Removed

- Removed private functions `toMediaQueries()`, `handleMediaQueries()`,
`unique()`.
