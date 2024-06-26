import React from 'react'
import { gql,useMutation } from '@apollo/client'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useNavigate,Link} from 'react-router-dom'
import { isValidInputTimeValue } from '@testing-library/user-event/dist/utils'
import TwitterLogo from '../styles/assets/X_logo.svg'
import '../styles/login.css'

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
      <img src = {TwitterLogo}
      alt = 'logo'
      style = {{width: "80px "}}
      className = "logo"
    />
      <h3> Login to Fake Twitter</h3>
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
        navigate('/profile')
      }}
    >
        <Form>
          <Field name = "email" type = "text" placeholder = "Email"/>
          <ErrorMessage name = "email" component = {"div"} />
          <Field name = "password" type = "text" placeholder = "Password"/>
          <ErrorMessage name = "password" component = {"div"} />
          <button type = 'submit' className='login-button'> <span>Log in</span> </button>
        </Form>

    </Formik>
    <div className="register">
      <h4> Don't have an account?</h4>
      <Link to = "/signup"> Sign up </Link>
    </div>
    </div>
  )
}

export default Login