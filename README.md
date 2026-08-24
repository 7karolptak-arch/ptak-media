# Ptak Media — Vercel-ready static site

This directory is a design-preserving static mirror of the current public site.

## Deploy on Vercel

1. Push this directory to a GitHub repository.
2. In Vercel, import the repository.
3. Set **Framework Preset** to `Other`.
4. Leave **Build Command** and **Output Directory** empty.
5. Deploy.

The site uses clean route folders (`/zespol`, `/konsultacja`, and both legal pages), so direct navigation and refreshes work on Vercel.

The broken `localhost:3000` Open Graph image references from the original deployment were corrected to `/og.png`.
