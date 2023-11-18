import React from 'react';
import logo from './logo.svg';
import { Container } from 'react-bootstrap';
import FishChart from './charts/FishChart';

function App() {
  return (
     <Container>
        <h1 className='header'>Welcome to the fish tracker for WA</h1>
        <FishChart />
     </Container>
  );
}

export default App;
