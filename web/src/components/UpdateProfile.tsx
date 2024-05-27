import { gql, useMutation, useQuery } from '@apollo/client';
import React, { useRef, useState } from 'react';
import { ME_QUERY } from '../pages/Profile';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import Modal from 'react-modal';
import { customStyles } from '../styles/CustomModalStyles';

const UPDATE_PROFILE_MUTATION = gql`
  mutation updateProfile(
    $id: Int!
    $bio: String
    $location: String
    $website: String
    $avatar: String
  ) {
    updateProfile(
      id: $id
      bio: $bio
      location: $location
      website: $website
      avatar: $avatar
    ) {
      id
    }
  }
`;

interface ProfileValues {
  id: number;
  bio: string;
  location: string;
  website: string;
  avatar: string;
}

function UpdateProfile() {
  const inputFile = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const { loading, error, data } = useQuery(ME_QUERY);
  const [updateProfile] = useMutation(UPDATE_PROFILE_MUTATION, {
    refetchQueries: [{ query: ME_QUERY }]
  });
  const [modalIsOpen, setIsOpen] = useState(false);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;

  const initialValues: ProfileValues = {
    id: data.profile.id,
    bio: data.profile.bio,
    location: data.profile.location,
    website: data.profile.website,
    avatar: data.profile.avatar,
  };

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  // const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = e.target.files;
  //   if (!files || files.length === 0) return;

  //   const data = new FormData();
  //   data.append('file', files[0]);
  //   data.append('upload_preset', 'twitter');
  //   setImageLoading(true);
  //   console.log('Cloudinary Endpoint:', process.env.REACT_APP_CLOUDINARY_ENDPOINT);
  //   // printed https://api.cloudinary.com/v1_1/dwe9dn827/image/upload successfully

  //   const res = await fetch(process.env.REACT_APP_CLOUDINARY_ENDPOINT, {
  //     method: 'POST',
  //     body: data,
  //   });

  //   const file = await res.json();
  //   setImage(file.secure_url);
  //   setImageLoading(false);
  // };
  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
  
    const data = new FormData();
    data.append('file', files[0]);
    data.append('upload_preset', 'twitter');
    setImageLoading(true);
  
    const cloudinaryEndpoint = process.env.REACT_APP_CLOUDINARY_ENDPOINT;
    if (!cloudinaryEndpoint) {
      console.error('Cloudinary Endpoint is not defined');
      setImageLoading(false);
      return;
    }
  
    console.log('Cloudinary Endpoint:', cloudinaryEndpoint);
  
    try {
      const res = await fetch(cloudinaryEndpoint, {
        method: 'POST',
        body: data,
      });
  
      const file = await res.json();
      setImage(file.secure_url);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setImageLoading(false);
    }
  };
  

  return (
    <div>
      <button onClick={openModal} className="edit-button">
        Edit Profile
      </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Modal"
        style={customStyles}
      >
        <input
          type="file"
          name="file"
          placeholder="Upload an image"
          onChange={uploadImage}
          ref={inputFile}
          style={{ display: 'none' }}
        />
        {imageLoading ? (
          <h3>Loading...</h3>
        ) : (
          <>
            {image ? (
              <span onClick={() => inputFile.current?.click()}>
                <img
                  src={image}
                  style={{ width: '150px', borderRadius: '50%' }}
                  alt="avatar"
                />
              </span>
            ) : (
              <span onClick={() => inputFile.current?.click()}>
                <i
                  className="fa fa-user fa-5x"
                  aria-hidden="true"
                ></i>
              </span>
            )}
          </>
        )}
        <Formik
          initialValues={initialValues}
          onSubmit={async (values, { setSubmitting }) => {
            setSubmitting(true);
            await updateProfile({
              variables: { ...values, avatar: image },
            });
            setSubmitting(false);
            setIsOpen(false);
          }}
        >
          <Form>
            <Field name="bio" type="text" as="textarea" placeholder="Bio" />
            <ErrorMessage name="bio" component="div" />
            <Field name="location" type="text" placeholder="Location" />
            <ErrorMessage name="location" component="div" />
            <Field name="website" type="text" placeholder="Website" />
            <ErrorMessage name="website" component="div" />
            <button type="submit" className="login-button">
              <span>Update Profile</span>
            </button>
          </Form>
        </Formik>
      </Modal>
    </div>
  );
}

export default UpdateProfile;
