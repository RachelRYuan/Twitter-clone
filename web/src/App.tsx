import React, { Component } from 'react';
import './App.css';
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client';
import Users from './components/Users';
import Landing from './components/Landing';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { setContext } from '@apollo/client/link/context'; 
import Signup from './pages/Signup';
import Login from './pages/Login';

const httpLink = new HttpLink({uri: "http://localhost:4000"})

const authLink = setContext(async (req, {headers}) => {
  const token = localStorage.getItem('token')

  return{
    ...headers,
      headers: {
        Authorization: token? `Bearer ${token}`: null
      }
  }
})

const link = authLink.concat(httpLink)
const client = new ApolloClient({
  link: (link as any),
  cache: new InMemoryCache()
})


function App(){
  return (  
  <ApolloProvider client={client}> 
    <Router>
      <Routes>
        <Route path="/" element={<Users />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  </ApolloProvider>
    )
} 

export default App;