import React from 'react';
import { Container } from 'react-bootstrap';
import FishChart from './charts/FishChart';
import { CatchArea } from './data/CatchArea';

import './App.css';

function App() {
  return (
     <Container>
        <h1 className='header'>Welcome to the fish tracker for WA</h1>
        <FishChart />
     </Container>
  );
}

export default App;
