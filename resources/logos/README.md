# Rave Route SVG collection

All 11 logos use white (#ffffff) RR lettering and lane markings with a charcoal (#2a2d32) road, designed for the app's coloured headers and launch screen. Theme colour comes from the surface behind the transparent logo.

- rave-route-logo-cleaned.svg: cleaned master.
- rave-route-logo-{red,blue,green,purple,pink}-{light,dark}.svg: matching filenames for the app's reactive theme selection. All use the same white and charcoal treatment in both appearances.

The original rough source was removed. All files are standalone, transparent, font-independent SVGs with the same square viewBox and four editable paths. Preview backgrounds show the actual theme primary colours and are not part of the SVGs.

Regenerate from the repository root with: node scripts/generate-logo-variants.cjs
Add --preview to also render logo-collection.png using sharp.
