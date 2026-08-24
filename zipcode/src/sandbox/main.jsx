import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import NewComponent from '../frontend/NewComponent';

const sampleSearchData = {
  query: 'What city is ZIP code 90210?',
  queryTerm: 'What city is ZIP code 90210?',
  keyword: '90210',
  entities: [
    { collectionName: 'ZIP_CODES', word: '90210', description: '90210' },
    { collectionName: 'CITIES', word: 'Beverly Hills', description: 'Beverly Hills' },
  ],
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <div style={{ minHeight: '100vh', background: '#f6f8fb' }}>
    <NewComponent searchData={sampleSearchData} />
  </div>
);