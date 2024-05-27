import { gql, useQuery } from '@apollo/client'
import React from 'react'
import CreateProfile from '../components/CreateProfile'
import UpdateProfile from '../components/UpdateProfile'
import { Link, useNavigate } from 'react-router-dom'
import "../styles/primary.css"
import "../styles/profile.css"
import LeftNav from '../components/leftNav'

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
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(ME_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <div className="primary">
      <div className="left">
        <LeftNav/>
      </div>
      <div className="profile">
        <div className="profile-info">
          <div className="profile-head">
            <span className="back-arrow" onClick={() => navigate(-1)}>
              <i className="fa fa-arrow-left" aria-hidden="true"></i>
            </span>
            <span className="nickname">
              <h3>{data.profile.name}</h3>
            </span>
          </div>
          <div className="avatar">
            {data.profile?.avatar ? (
              <img
                src={data.profile.avatar}
                style={{ width: "150px", borderRadius: "50%" }}
                alt="avatar"
              />
            ) : (
              <i className="fa fa-user fa-5x" aria-hidden="true"></i>
            )}
          </div>
          <div className="make-profile">
            {data.profile ? <UpdateProfile /> : <CreateProfile />}
          </div>

          <h3 className="name">{data.profile.name}</h3>

          {data.profile ? (
            <p>
              <i className="fas fa-link"> </i>{" "}
              <Link
                to={{ pathname: `http://${data.profile.website}` }}
                target="_blank"
              >
                {data.profile.website}
              </Link>
            </p>
          ) : null}
          <div className="followers">
            <p>384 followers</p>
          </div>
          <div className="right">
            right
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile