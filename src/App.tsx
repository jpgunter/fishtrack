import React from 'react';
import logo from './logo.svg';
import { Container } from 'react-bootstrap';
import FishChart from './charts/FishChart';
import { CatchArea } from './data/CatchArea';

function App() {
  return (
     <Container>
        <h1 className='header'>Welcome to the fish tracker for WA</h1>
        <FishChart />
        <pre>
           {JSON.stringify(CatchArea.areas, null, 2)}
        </pre>
     </Container>
  );
}

export default App;
