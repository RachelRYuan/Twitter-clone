import React from 'react'
import { gql,useMutation } from '@apollo/client'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useNavigate,Link} from 'react-router-dom'
import { isValidInputTimeValue } from '@testing-library/user-event/dist/utils'
import TwitterLogo from '../styles/assets/X_logo.svg'
import '../styles/login.css'

const SIGNUP_MUTATION = gql`
mutation signup($name: String, $email: String!, $password: String!){
    signup(name: $name, email: $email, password: $password){
        token
    }
} 
`
interface SignupValues{
  email: string
  password: string
  confirmPassword: string
  name: string
}


function Signup() {
  const navigate = useNavigate()
  const [signup, {data}] = useMutation(SIGNUP_MUTATION)

  const initialValues: SignupValues = {
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  }

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email Required"),
  password: Yup.string()
    .max(20, "Must be 20 characters or less")
    .required("Password Required"),
  confirmPassword: Yup.string().oneOf(
      [ Yup.ref("password") ], 
      "Passwords must match"
    ),
  name: Yup.string()
    .max(15, "Must be 15 characters or less")
    .required("Name Required")
})

  return (
    <div>
      <img src = {TwitterLogo}
      alt = 'logo'
      style = {{width: "80px "}}
      className = "logo"
    />
      <h3> Sign up </h3>
      <Formik
      initialValues = {initialValues}
      validationSchema = {validationSchema}
      onSubmit = {async(values, {setSubmitting}) =>{
        setSubmitting(true)
        const response = await signup({
            variables: values
        })
        localStorage.setItem("token", response.data.signup.token)
        setSubmitting(false)
        navigate('/users')
      }}
    >
        <Form>
          <Field name = "email" type = "text" placeholder = "Email"/>
          <ErrorMessage name = "email" component = {"div"} />
          <Field name = "name" type = "text" placeholder = "Name"/>
          <ErrorMessage name = "name" component = {"div"} />
          <Field name = "password" type = "text" placeholder = "Password"/>
          <ErrorMessage name = "password" component = {"div"} />
          <Field name = "confirmPassword" type = "text" placeholder = "Comfirm Password"/>
          <ErrorMessage name = "comfirmpassword" component = {"div"} />
          <button type = 'submit' className='login-button'> <span>Sign up</span> </button>
        </Form>
    </Formik>        
    <div className="register">
          <h4>Already have an account?</h4>
          <Link to = "/login">Log in </Link>
        </div>
    </div>
  )
}

export default Signup