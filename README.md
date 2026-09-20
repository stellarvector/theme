# Stellar Vector theme

Shared Hugo module for stellarvector sites: tokens, fonts, icons, logos, chrome and behaviour.

See every component: cd exampleSite && hugo server

Required per-site params: host, analytics.website_id, analytics.domains, css.extra (ordered), js.extra (ordered).
Defaults live in hugo.yml.

Rules
- Anything added here must appear in exampleSite and be used by a real site.
- No inline JavaScript. External files only.
- Site overrides go in @layer utilities, after the theme in concat order.
- scripts/check-gallery.sh and scripts/lint-theme.sh must pass; CI runs both.
