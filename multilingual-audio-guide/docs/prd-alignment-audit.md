# PRD alignment audit — UC06 Mobile Web offline content

Source: PRD_GROUP8.pdf, Chapter 2, UC06_Visitor (pp. 35–38), and Chapter 1 scope (pp. 4–5).

## Confirmed implementation discrepancy

- The PRD says audio and images depend on assets available per landmark. An absent audio URL should not prevent downloading the other landmark content.
- UC06's offline package consists of saved landmark text, images, and audio where available; downloading an offline GeoJSON map is not required for success.
- The package must be confirmed only after all required available assets and saved text are available in the same browser.

## Changes made

- Skip unavailable audio and image URLs instead of failing the entire download.
- Do not require the additional GeoJSON map for an offline package.
- Check for saved landmark text as well as cached media when reporting a saved package.
- Write the download manifest only after asset downloads, shell caching, and text persistence finish.

## Manual regression checklist

1. Export and serve the Mobile Web production build on HTTPS or localhost.
2. Download VI package with all seven landmarks and available media; expect success and reopen offline in the same browser.
3. Repeat for EN.
4. Remove one audio URL from test fixture; package should still download and show the associated transcript without playback.
5. Simulate an unavailable media URL and verify download is reported as failed, not saved.
6. Clear the landmark text storage while preserving Cache Storage; verify the package is not reported as saved.
7. Confirm an offline page displays text/images and plays cached audio in the same browser.
8. Confirm Google Maps directions still need an internet connection.

## Scope of verification

This patch addresses a confirmed UC06 mismatch only. Other PRD use cases have corresponding source modules, but their complete behavior, CI, deployment, and database integration have **not** been verified by end-to-end tests here. Do not claim full PRD compliance without running the test matrix.
