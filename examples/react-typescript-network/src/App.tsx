import React from 'react';
import { Route } from 'react-router';
import Layout  from './components/Layout';
import { BasicGraph } from './components/BasicGraph';

export default function App() {
  return (
    <Layout>
      <Route exact path='/' component={BasicGraph} />
    </Layout>
  );
}
