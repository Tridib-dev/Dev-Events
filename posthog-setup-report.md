# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into the DevEvent Next.js App Router project. The following changes were made:

- **`instrumentation-client.ts`**: Fixed env var name to `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, added reverse proxy `api_host` (`/ingest`), `ui_host`, `capture_exceptions: true`, and debug mode for development.
- **`next.config.ts`**: Added PostHog reverse proxy rewrites for `/ingest/static/*`, `/ingest/array/*`, and `/ingest/*`, plus `skipTrailingSlashRedirect: true`.
- **`app/posthog.ts`**: Fixed env var name from `NEXT_PUBLIC_POSTHOG_TOKEN` to `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` in the server-side PostHog client.
- **`components/Explore.tsx`**: Added `explore_events_clicked` capture when user clicks the Explore Events button.
- **`components/EventCard.tsx`**: Converted to a client component; added `event_card_clicked` capture with `slug`, `title`, `location`, and `date` properties.
- **`components/Navbar.tsx`**: Added `nav_link_clicked` capture with `destination` property for each nav link.
- **`.env.local`**: Ensured `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` are set to the correct values.

| Event | Description | File |
|---|---|---|
| `explore_events_clicked` | User clicks the "Explore Events" hero button to scroll to the events list | `components/Explore.tsx` |
| `event_card_clicked` | User clicks an event card; includes `slug`, `title`, `location`, `date` properties | `components/EventCard.tsx` |
| `nav_link_clicked` | User clicks a navigation link; includes `destination` property (Home, Events, Create Event) | `components/Navbar.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/473053/dashboard/1721029)
- [Explore Events Button Clicks](https://us.posthog.com/project/473053/insights/EZVFFxNI)
- [Event Card Clicks by Event](https://us.posthog.com/project/473053/insights/LLvCv1oA)
- [Navigation Clicks by Destination](https://us.posthog.com/project/473053/insights/9k86FARH)
- [All User Interactions](https://us.posthog.com/project/473053/insights/EOkoAPGB)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
