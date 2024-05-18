import React from 'react';

import './App.css';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InMemoryCache
})

function App(){
  return (
  <ApolloProvider client={client}> 
    <div>test</div>
  </ApolloProvider>
    )
}

export default App;