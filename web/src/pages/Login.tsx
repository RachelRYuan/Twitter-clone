import React from 'react'
import { gql,useMutation } from '@apollo/client'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useNavigate} from 'react-router-dom'
import { isValidInputTimeValue } from '@testing-library/user-event/dist/utils'

const login_MUTATION = gql`
mutation login( $email: String!, $password: String!){
    login( email: $email, password: $password) {
        token
    }
} 
`
interface LoginValues{
  email: string
  password: string
}


function Login() {
  const navigate = useNavigate()
  const [login, {data}] = useMutation(login_MUTATION)

  const initialValues: LoginValues = {
    email: '',
    password: '',
  }

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email Required"),
  password: Yup.string()
    .max(20, "Must be 20 characters or less")
    .required("Password Required"),
})

  return (
    <div>
      <h1> Login </h1>
      <Formik
      initialValues = {initialValues}
      validationSchema = {validationSchema}
      onSubmit = {async(values, {setSubmitting}) =>{
        setSubmitting(true)
        const response = await login({
            variables: values
        })
        localStorage.setItem("token", response.data.login.token)
        setSubmitting(false)
        navigate('/users')
      }}
    >
        <Form>
          <Field name = "email" type = "text" placeholder = "Email"/>
          <ErrorMessage name = "email" component = {"div"} />
          <Field name = "password" type = "text" placeholder = "Password"/>
          <ErrorMessage name = "password" component = {"div"} />
          <button type = 'submit'> Login </button>
        </Form>

    </Formik>
    </div>
  )
}

export default Login