import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, Heading, Link, Lozenge, Stack, Spinner, SectionMessage } from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => { invoke('recall').then(setData).catch(e => setErr(String(e))); }, []);
  if (err) return <SectionMessage appearance="error"><Text>{err}</Text></SectionMessage>;
  if (!data) return <Spinner label="Recalling context" />;
  return (
    <Stack space="space.200">
      <Heading as="h4">Already decided</Heading>
      {data.decisions.length ? data.decisions.map(d => (
        <Text key={d.url}><Link href={d.url}>{d.title}</Link> {d.excerpt}</Text>
      )) : <SectionMessage appearance="warning"><Text>No recorded decision touches this issue. Write one and label it "decision".</Text></SectionMessage>}
      <Heading as="h4">Related work</Heading>
      {data.related.length ? data.related.map(r => (
        <Text key={r.key}>{r.key} {r.summary} <Lozenge>{r.status}</Lozenge> {r.owner}</Text>
      )) : <Text>Nothing similar found.</Text>}
      <Text>Matched on: {data.keywords.join(', ')}</Text>
    </Stack>
  );
};
ForgeReconciler.render(<React.StrictMode><App /></React.StrictMode>);
