import React from 'react'
import { gql,useQuery } from '@apollo/client'
import { useNavigate } from 'react-router-dom'

const IS_LOGGED_IN = gql`
{
    me {
        id
    }
}`

interface Props {
    children?: React.ReactNode
}

export default function IsAuthenticated({ children }: Props) {
    const { loading, error, data } = useQuery(IS_LOGGED_IN)
    const navigate = useNavigate()
    if (loading) return <p>Loading...</p>
    if (error) return <p>{error.message}</p>
    if (!data.me) {
      navigate('/landing')
      return null
    }
    return <>{children}</>
  }
  
  

