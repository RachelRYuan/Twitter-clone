import { gql, useQuery } from '@apollo/client'
import React from 'react'
import CreateProfile from '../components/CreateProfile'

export const ME_QUERY = gql`
  query ME_QUERY {
      profile {
        id
        bio
        location
        website
        avatar
      }
  }
`

function Profile() {
    const {loading,error,data} = useQuery(ME_QUERY)
    console.log('Loading:', loading);
    console.log('Error:', error);
    console.log('Data:', data);
    if (loading) return <p>loading</p>
    if (error) return <p>{error.message}</p>
  return (
    <div className="container">
          <h1>Profile</h1>
          <CreateProfile />
            {/* <p>{data.me.Profile.id}</p>
            <p>{data.me.Profile.bio}</p>
            <p>{data.me.Profile.location}</p>
            <p>{data.me.Profile.website}</p> */}
        </div>
  )
}

export default Profile