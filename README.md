# TEDxAmsterdam website

The website for [tedxamsterdam.nl](https://www.tedxamsterdam.nl), built with [Next.js](https://nextjs.org) and the [TEDxAmsterdam design system](https://github.com/tedx-amsterdam/tedx-amsterdam-design-system).

> **Status:** work in progress. This project will replace the current Webflow site. Until then, content is read from the Webflow CMS. See the [roadmap](docs/roadmap.md) for what is done and what comes next.

## Getting started

Requirements: Node.js 22 (see `.nvmrc`) and npm.

```bash
git clone https://github.com/tedx-amsterdam/tedx-amsterdam-website.git
cd tedx-amsterdam-website
npm install
cp .env.example .env.local   # then set CONTENT_SOURCE=fixtures
npm run dev
```

`CONTENT_SOURCE=fixtures` runs the site on static test data without any token. `CONTENT_SOURCE=webflow` reads the live Webflow CMS and needs `WEBFLOW_API_TOKEN`; ask the maintainer for it.

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the static site into `out/` |
| `npm test` | Run the tests once |
| `npm run test:watch` | Run the tests on every change |
| `npm run typecheck` | Check types |
| `npm run lint` | Lint the code |

Before opening a pull request, run `npm run lint && npm run typecheck && npm test`. CI runs the same checks plus a build.

To preview the production build locally, serve the `out/` folder with any static file server, for example `npx serve out`.

## How the project is organised

```
src/app/          Routes and pages
src/components/   Site components, including the design system entry point
src/config/       Site settings: navigation, links, legal text
public/           Static files
tests/            Tests
docs/             Project documentation
```

Two rules matter most:

1. **UI comes from the design system.** Import its components from `@/components/design-system`, never from the package directly. The lint setup enforces this; the file explains why.
2. **Pages never talk to a CMS directly.** Content goes through a content layer, so the CMS can change without rewriting pages.

The full set of conventions, including the reasoning behind them, is in [CLAUDE.md](CLAUDE.md). It is written for both human contributors and AI assistants.

## Contributing

- One pull request per feature, bug fix or chore.
- Create a branch from `main` named `<type>/<description>`, for example `feature/events-page` or `bugfix/footer-links`.
- Make small, focused commits in the [Conventional Commits](https://www.conventionalcommits.org) format, for example `feat(events): add upcoming events list`.
- Open a pull request using the template, check the Cloudflare preview and wait for CI to pass.
- Never commit secrets. Environment variables go in `.env.local`, which git ignores.

The full conventions for commits, branches and pull requests are in [CLAUDE.md](CLAUDE.md#git-workflow).

## License

Code is released under the MIT license. TED, TEDx and the TEDxAmsterdam name and logo are trademarks and are not covered by this license.
