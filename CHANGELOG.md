# Changelog

All notable changes to this project will be documented in this file.

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
