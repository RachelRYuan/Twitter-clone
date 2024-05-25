import { gql, useQuery } from '@apollo/client'
import React from 'react'
import CreateProfile from '../components/CreateProfile'
import UpdateProfile from '../components/UpdateProfile'

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
    if (loading) return <p>loading</p>
    if (error) return <p>{error.message}</p>
  return (
    <div className="container">
          <h1>Profile</h1>
            {data.profile.id? <UpdateProfile/> : <CreateProfile/>}
            <p>{data.profile.bio}</p>
            <p>{data.profile.location}</p>
            <p>{data.profile.website}</p> 
        </div>
  )
}

export default Profile