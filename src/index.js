const Resolver = require('@forge/resolver').default;
const { recallFor } = require('./recall');

const resolver = new Resolver();
resolver.define('recall', async ({ context }) => recallFor(context.extension.issue.key));

exports.handler = resolver.getDefinitions();
exports.recallAction = async (payload) => {
  const key = payload?.issueKey || payload?.context?.jira?.issueKey;
  if (!key) return 'Give me a Jira issue key, like PROJ-12.';
  return (await recallFor(key)).summary;
};
