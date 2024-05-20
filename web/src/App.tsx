import React, { Component } from 'react';
import './App.css';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import Users from './components/Users';
import Landing from './components/Landing'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';



const client = new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InMemoryCache
})

function App(){
  return (  
  <ApolloProvider client={client}> 
    <Router>
      <Routes>
        <Route path="/" element={<Users />} />
        <Route path="/landing" element={<Landing />} />
      </Routes>
    </Router>
  </ApolloProvider>
    )
} 

export default App;