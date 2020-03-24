import React, { useEffect, useState } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import * as queryString from 'query-string'
import axios from 'axios'
import { ActionTypes } from '../actionTypes.js'
import { useDispatch } from 'react-redux';


export function LoginCallback() {
  const location = useLocation()
  let history = useHistory()
  const { code } = queryString.parse(location.search)
  let [userData, setUserData] = useState({
    email: '',
    name: '',
    username: ''
  })
  let dispatch = useDispatch()
  // const addUser = (userData) => ();

  useEffect(() => {
    async function fetchData(code) {
      const { data } = await axios({
        url: `https://oauth2.googleapis.com/token`,
        method: 'post',
        data: {
          client_id: process.env.REACT_APP_CLIENT_ID,
          client_secret: process.env.REACT_APP_CLIENT_SECRET,
          redirect_uri: 'http://localhost:3000/auth/redirect',
          grant_type: 'authorization_code',
          code,
        },
      });

      const { data: fetchedUserData } = await axios({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo',
        method: 'get',
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });
      setUserData({ ...userData, email: fetchedUserData.email, name: fetchedUserData.name })
    }
    fetchData(code)
  }, [])

  async function handleSubmit() {
    const { data: { found: userExists } } = await axios.get(`http://localhost:8000/api/auth/check?username=${userData.username}`)
    console.log(userData)
    if (!userExists) {
      const { data: { token: token } } = await axios({
        url: 'http://localhost:8000/api/auth/login',
        method: 'post',
        data: userData
      })
      dispatch({
        type: ActionTypes.AddUser,
        userData
      })
      localStorage.setItem('woyl-token', token)
      history.push('/dashboard')
    }
  }

  return (
    <div>
      <label for='name'>Name</label>
      <input type='text' value={userData.name}></input>
      <label for='email'>Email</label>
      <input type='text' value={userData.email}></input>
      <label for='username'>Username</label>
      <input type='text' onChange={(e) => setUserData({ ...userData, username: e.target.value })} value={userData.username}></input>
      <button onClick={() => handleSubmit()}>Submit</button>
    </div>
  )
}
