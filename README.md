# Decision Recall

A Forge app for Jira and Confluence, built for Atlassian Codegeist 2026 (Apps for Software Teams, plus the Rovo agent bonus).

Teams re-decide things they already decided. Decision Recall reads the issue you're on, pulls its key terms, and shows:

- decisions already recorded in Confluence (pages labelled `decision`, or titled "Decision"/"ADR")
- related Jira issues, their status and who owned them

It does this in two places:

1. A Jira issue panel ("Decision Recall"), UI Kit.
2. A Rovo agent ("Decision Recall") with a `recall-context` action, so any agent or chat can ask "what has already been decided about PROJ-12?"

## How it works

- `src/core.js`: keyword extraction, JQL/CQL building and ranking. Pure, tested offline (`npm test`, 7 tests).
- `src/recall.js`: reads the issue (Jira REST v3), searches related issues (`/rest/api/3/search/jql`) and decision pages (Confluence CQL search), all `asUser()` so permissions are respected.
- `src/index.js`: the panel resolver and the Rovo action handler.
- `src/frontend/index.jsx`: the panel.

## Run it

```
npm install -g @forge/cli
npm install
forge register        # new app id into manifest.yml
forge deploy
forge install --product jira
npm test
```

Record decisions in Confluence with the label `decision` and they surface on every issue that touches the same words.

## Privacy

See [PRIVACY.md](PRIVACY.md). No data leaves Atlassian.

## Licence

MIT
