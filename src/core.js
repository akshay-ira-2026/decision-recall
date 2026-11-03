// Pure logic, no Forge calls: testable offline.
const STOP = new Set('a an the and or of to for in on with by is are be at from as it this that into via add fix bug update make use new support when not'.split(' '));

function keywords(text, max = 6) {
  const counts = {};
  (text || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/)
    .filter(w => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w))
    .forEach(w => { counts[w] = (counts[w] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, max).map(([w]) => w);
}

function esc(s) { return String(s).replace(/["\\]/g, ''); }

function jqlFor(issueKey, words, projectKey) {
  if (!words.length) return null;
  const text = words.map(w => `text ~ "${esc(w)}"`).join(' OR ');
  const proj = projectKey ? `project = "${esc(projectKey)}" AND ` : '';
  return `${proj}key != "${esc(issueKey)}" AND (${text}) ORDER BY updated DESC`;
}

function cqlFor(words) {
  if (!words.length) return null;
  const text = words.map(w => `text ~ "${esc(w)}"`).join(' OR ');
  return `type = page AND (label = "decision" OR title ~ "decision" OR title ~ "ADR") AND (${text}) ORDER BY lastmodified DESC`;
}

function overlap(words, text) {
  const t = (text || '').toLowerCase();
  return words.filter(w => t.includes(w)).length;
}

function rankIssues(words, issues) {
  return (issues || []).map(i => ({
    key: i.key,
    summary: i.fields?.summary || '',
    status: i.fields?.status?.name || '',
    owner: i.fields?.assignee?.displayName || 'Unassigned',
    score: overlap(words, i.fields?.summary) * 2 + (i.fields?.status?.statusCategory?.key === 'done' ? 1 : 0),
  })).filter(i => i.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
}

function rankPages(words, results, baseUrl) {
  return (results || []).map(r => ({
    title: r.content?.title || r.title || '',
    url: (baseUrl || '') + (r.url || r.content?._links?.webui || ''),
    excerpt: (r.excerpt || '').replace(/@@@(end)?hl@@@/g, '').slice(0, 200),
    score: overlap(words, (r.content?.title || r.title || '') + ' ' + (r.excerpt || '')),
  })).filter(p => p.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
}

function summarise(issueKey, decisions, related) {
  const lines = [];
  if (decisions.length) {
    lines.push(`Already decided (${decisions.length}):`);
    decisions.forEach(d => lines.push(`- ${d.title} ${d.url}`));
  } else {
    lines.push(`No recorded decision touches ${issueKey}. Consider writing one (label it "decision").`);
  }
  if (related.length) {
    lines.push(`Related work (${related.length}):`);
    related.forEach(r => lines.push(`- ${r.key} ${r.summary} [${r.status}] owner: ${r.owner}`));
  }
  return lines.join('\n');
}

module.exports = { keywords, jqlFor, cqlFor, rankIssues, rankPages, summarise };
