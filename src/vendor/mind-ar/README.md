# MindAR browser runtime

Vendored from `mind-ar` 1.2.5 (MIT) because the npm package includes Node-only compiler dependencies that are not used by this application. Only the production image-tracking entry and its two generated chunks are included.

The entry imports `three-mindar`, an npm alias pinned to Three 0.160.1, instead of the app's Three 0.183 runtime. Two unreachable Node-only `require()` branches were replaced with explicit errors so Turbopack can package this browser-only runtime. `stop()` also tolerates partial startup and removes its resize listener. Tracking algorithms were not changed. See `LICENSE` in this directory.
