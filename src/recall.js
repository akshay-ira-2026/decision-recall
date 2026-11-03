const api = require('@forge/api');
const { route } = api;
const core = require('./core');

async function recallFor(issueKey) {
  const ir = await api.asUser().requestJira(route`/rest/api/3/issue/${issueKey}?fields=summary,description,project,labels`);
  if (!ir.ok) throw new Error(`Could not read ${issueKey} (${ir.status})`);
  const issue = await ir.json();
  const desc = JSON.stringify(issue.fields?.description || '').replace(/"type":"[a-z]+"|[{}\[\]",:]/g, ' ');
  const words = core.keywords(`${issue.fields.summary} ${issue.fields.summary} ${(issue.fields.labels || []).join(' ')} ${desc}`);

  let related = [];
  const jql = core.jqlFor(issueKey, words, issue.fields?.project?.key);
  if (jql) {
    const sr = await api.asUser().requestJira(route`/rest/api/3/search/jql`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jql, maxResults: 20, fields: ['summary', 'status', 'assignee'] }),
    });
    if (sr.ok) related = core.rankIssues(words, (await sr.json()).issues);
  }

  let decisions = [];
  const cql = core.cqlFor(words);
  if (cql) {
    const cr = await api.asUser().requestConfluence(route`/wiki/rest/api/search?cql=${cql}&limit=20`);
    if (cr.ok) { const body = await cr.json(); decisions = core.rankPages(words, body.results, body._links?.base); }
  }
  return { issueKey, keywords: words, decisions, related, summary: core.summarise(issueKey, decisions, related) };
}
module.exports = { recallFor };
