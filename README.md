# PDCAT Conference Website https://www.pd-cat.org/

This repository hosts the official PDCAT conference website using GitHub Pages and a custom domain.

## Website Structure

The website uses a folder based structure so that different conference years can be maintained separately while sharing common assets.

### Root level
- `index.html`  
  The portal entry page for the main domain.

- `CNAME`  
  Custom domain configuration for GitHub Pages.

- `robots.txt`  
  Search engine crawling configuration.

- `sitemap.xml`  
  Sitemap for search engines. This file must be updated whenever a new conference year or new public page is added.

- `favicon.ico`, `favicon.png`  
  Site icons.

### Shared assets
- `css/`  
  Shared stylesheets used across conference years.

- `js/`  
  Shared JavaScript files.

- `vendor/`  
  Shared third party libraries.

### Conference year folders
Each conference edition is stored in its own folder, for example:

- `2025/`
- `2026/`
- `2027/`

Each year folder should contain its own pages and year specific assets, such as:
- `index.html`
- `call_for_paper.html`
- `submission.html`
- `program.html`
- `keynote.html`
- `venue.html`
- `organization.html`
- `img/`

## Maintenance Rules

### 1. Add a new conference year
When adding a new conference edition:

1. Create a new folder such as `2026/`
2. Add the year specific pages and images
3. Update the root `index.html` so the portal page links to the new year
4. Update `sitemap.xml`
5. Check that all links work correctly under the new folder

### 2. Update sitemap.xml
**Important:** Every time a new conference year is added, or a new public page is created, `sitemap.xml` must be updated.

Examples:
- Add `/2026/`
- Add `/2026/call_for_paper.html`
- Add `/2026/submission.html`
- Add `/2026/program.html`

If `sitemap.xml` is not updated, search engines may not discover the new pages correctly.

### 3. Shared assets
Files in `css/`, `js/`, and `vendor/` are shared by multiple conference years.  
Please avoid putting year specific content directly into shared files unless it is intended for all years.

For year specific images such as the homepage header image, keep them inside the corresponding year folder, for example:

- `/2025/img/header.jpeg`
- `/2026/img/header.jpeg`

## Deployment

This site is deployed with GitHub Pages and served through the custom domain:

`https://www.pd-cat.org/`

## Notes

- Keep the root portal page simple and stable
- Keep each conference year self contained
- Always test links after adding a new year
- Always update `sitemap.xml` after adding a new year or new public page
