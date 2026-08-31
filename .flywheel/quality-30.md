# 30 quality gates

Run: `node scripts/quality-30.mjs`

1. `html[lang=pl]` on every page
2. Unique `<title>` per page, includes Ptak Media
3. Meta description present, ≤160 chars, Polish, no income promise
4. Canonical URL set
5. Open Graph title + description
6. Skip link to content
7. Primary nav includes Umów konsultację → `/konsultacja`
8. Mobile menu has the same CTA
9. Hero has one primary CTA (not three competing buttons)
10. Copy is language-school nabor, not generic ads agency
11. No Operator 10K / lime-on-black OPERATOR brand leak
12. No “gwarantujemy X uczniów” without contract framing
13. Phone numbers match MEMORY
14. `/konsultacja` exists and is reachable
15. `/zespol` exists
16. Privacy policy linked
17. Cookies policy linked
18. FAQ exists with real school-owner objections
19. 404 page exists
20. sitemap.xml lists live routes
21. robots.txt allows indexing
22. Images have alt (logo included)
23. Buttons are real `<a>` or `<button>`, not clickable divs
24. Contrast: body text is not gray-on-gray mush
25. Form or consult page has a single next step
26. Footer repeats contact
27. JSON-LD ProfessionalService present on home
28. No mixed English headlines on Polish pages
29. CTA label is Umów konsultację (not “Learn more”)
30. `quality-30.mjs` exit 0 only when 1–29 pass
