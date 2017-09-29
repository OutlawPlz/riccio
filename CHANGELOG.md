# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

Log of unreleased changes.

### Added

- UMD support.
- Added `getInstance()`, `isInitialized()` functions.
- Added `buildLayout()` function. Called on init and when a media query is
triggered.

### Changed

- Improved Gulp tasks.
- Refactor test folder.

### Deprecated

- Deprecated `getStore()` function. To get an initialized Riccio instance use
`getInstance()`.
- Deprecated `Riccio.prototype.needs()`, `Riccio.prototype.setRows()` and
`Riccio.prototype.setItems()` in favor of `Riccio.prototype.buildLayout()`.
