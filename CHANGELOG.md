## [0.4.6](https://github.com/remanufacturing/react-truncate/compare/v0.4.5...v0.4.6) (2025-01-19)


### Bug Fixes

* **build:** adjust the entry file and CDN configuration ([1b762e6](https://github.com/remanufacturing/react-truncate/commit/1b762e69d92e88c900f8f7a52666ef1ec3c038c6))



## [0.4.5](https://github.com/remanufacturing/react-truncate/compare/v0.4.4...v0.4.5) (2025-01-17)


### Bug Fixes

* **build:** iife bundler corruption ([c29f135](https://github.com/remanufacturing/react-truncate/commit/c29f135e98b4479c886dd7c34feef72f052c2946))



## [0.4.4](https://github.com/remanufacturing/react-truncate/compare/v0.4.3...v0.4.4) (2025-01-03)


### Bug Fixes

* **ShowMore:** Ensure onTruncate callback is called in ShowMore component ([f4e221e](https://github.com/remanufacturing/react-truncate/commit/f4e221e4f07ea90bac1271e9bd15443e1f1377d5))



## [0.4.3](https://github.com/remanufacturing/react-truncate/compare/v0.4.2...v0.4.3) (2024-10-22)


### Bug Fixes

* **Truncate:**: include letter-spacing for more accurate measurements on Truncate ([16c5a3b](https://github.com/remanufacturing/react-truncate/commit/16c5a3bc7d790dbfa324dce6e8b99fdbab3e9934))



## [0.4.2](https://github.com/remanufacturing/react-truncate/compare/v0.4.1...v0.4.2) (2024-08-18)


### Bug Fixes

* fix: removes dependency on react and react-dom ([0918b4a](https://github.com/remanufacturing/react-truncate/commit/0918b4a85f8374833323af835698f7e966cc57d5))



## [0.4.1](https://github.com/remanufacturing/react-truncate/compare/v0.4.0...v0.4.1) (2024-04-23)


### Bug Fixes

* **Truncate:** fix the calculation result deviation problem of middle truncate ([f1625ac](https://github.com/remanufacturing/react-truncate/commit/f1625acbfd9f5756d532e2f9ecc31f694ea8c6bb))



# [0.4.0](https://github.com/remanufacturing/react-truncate/compare/v0.3.2...v0.4.0) (2024-04-21)


### Bug Fixes

* **MiddleTruncate:** ignore omit's props when passed in rests ([3ed2714](https://github.com/remanufacturing/react-truncate/commit/3ed2714ec39bb9914a61844630132ba893afe098))
* **ShowMore:** ignore omit's props when passed in rests ([ec62636](https://github.com/remanufacturing/react-truncate/commit/ec62636952d6c6621bbde3b214c5a207ae52bec9))
* **Truncate:** fixed a calculation error where end is 0 when middle mode is enabled ([84f8424](https://github.com/remanufacturing/react-truncate/commit/84f84248719e10673fd4ae1aa978d468d4765e0d))


### Features

* **ShowMore:** add custom buttons support and toggle state change callback ([71bcb94](https://github.com/remanufacturing/react-truncate/commit/71bcb944d23e8def9c31f9a10e632b5509bd6444))
* **Truncate:** add safe and positive integer check for the lines prop value ([9f84142](https://github.com/remanufacturing/react-truncate/commit/9f8414227100e012befc33019e77199c33dcf733))
* **Truncate:** update comments for types ([bf1c365](https://github.com/remanufacturing/react-truncate/commit/bf1c3650180dc841b5ff558988410c1642e13723))



## [0.3.2](https://github.com/remanufacturing/react-truncate/compare/v0.3.1...v0.3.2) (2024-01-20)


### Bug Fixes

* **Truncate:** when the middle option is enabled, the wrong end fragment is obtained ([0f7d2cf](https://github.com/remanufacturing/react-truncate/commit/0f7d2cf7a01c08ab241327b762a6ee0289971972))



## [0.3.1](https://github.com/remanufacturing/react-truncate/compare/v0.2.0...v0.3.1) (2024-01-20)


### Bug Fixes

* **MiddleTruncate:** omit the  prop and set its default value be true ([258b46e](https://github.com/remanufacturing/react-truncate/commit/258b46ea852d6a014899ef440fcac271e522571a))



# [0.3.0](https://github.com/remanufacturing/react-truncate/compare/v0.2.0...v0.3.0) (2024-01-20)


### Features

* **MiddleTruncate:** add a component for truncating string from middle ([90fbe81](https://github.com/remanufacturing/react-truncate/commit/90fbe819c4c73ef61b6fd78a84f3d3647b801865))
* **ShowMore:** adjust props with MiddleTruncate ([7fbb866](https://github.com/remanufacturing/react-truncate/commit/7fbb866d7e59b62ca1e5a2bdd8abf790d89fc73c))
* **ShowMore:** adjust props with Truncate ([253892d](https://github.com/remanufacturing/react-truncate/commit/253892de8c31b7a41fd96aa17eaa0d49e10356bf))
* **Truncate:** supports truncating a string at a specified position in the middle and generating an ellipsis symbol at that position ([7dec6b4](https://github.com/remanufacturing/react-truncate/commit/7dec6b475471f528bbfd3ca883e46b584c3c33be))



# 0.2.0 (2023-11-27)


### Features

* **Truncate:** add custom separator to support multiple languages ([7b47463](https://github.com/remanufacturing/react-truncate/commit/7b47463e56c50473e1d20f619f5187c1847a84d9)), closes [#16](https://github.com/remanufacturing/react-truncate/issues/16)


## [0.1.2](https://github.com/remanufacturing/react-truncate/compare/v0.1.1...v0.1.2) (2023-11-26)


### Bug Fixes

* **ShowMore:** remove redundant width constraints to accommodate parent width changes ([01396b1](https://github.com/remanufacturing/react-truncate/commit/fc1aeff4ec720b37ae6fd5f3add87f6d20da6990)), closes [#14](https://github.com/remanufacturing/react-truncate/issues/14)



## [0.1.1](https://github.com/remanufacturing/react-truncate/compare/v0.1.0...v0.1.1) (2023-11-25)


### Bug Fixes

* **ShowMore:** add  window resize listener to update content width ([4b3029b](https://github.com/remanufacturing/react-truncate/commit/3f35055f7fb985875e23bc3bb0765ade6ce14fb7)), closes [#12](https://github.com/remanufacturing/react-truncate/issues/12)



# 0.1.0 (2023-11-13)


### Features

* **ShowMore:** add default width via parent element ([51c06e3](https://github.com/remanufacturing/react-truncate/commit/51c06e390fbcbd214e7aaae66aabd03b2c95de1d))


### Refactor

* Refactor using TypeScript and Functional Components ([5ea60d9](https://github.com/remanufacturing/react-truncate/commit/5ea60d983f61a8ab089a243cc4f74d034484900b))



