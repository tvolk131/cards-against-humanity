import React from 'react';
import axios from 'axios';
import GoogleButton from 'react-google-button';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: ''
    }
    this.handleInputChange = this.handleInputChange.bind(this);
    this.sendLoginRequest = this.sendLoginRequest.bind(this);
  }

  handleInputChange (property, e) {
    let stateChange = {};
    stateChange[property] = e.target.value;
    this.setState(stateChange);
  }

  sendLoginRequest () {
    if (this.state.email && this.state.password) {
      axios.post('/login', {
        email: this.state.email,
        password: this.state.password
      })
      .then((res) => {
        window.location.replace(res.request.responseURL); // Performs redirect to proper page
        return res;
      });
    } else {
      let missingVals = [];
      if (!this.state.email) {
        missingVals.push('email');
      }
      if (!this.state.password) {
        missingVals.push('password');
      }
      let errorString = `Incomplete! You're missing`;
      for (let i = 0; i < missingVals.length; i++) {
        if (i === missingVals.length - 1 && missingVals.length > 1) {
          errorString += ', and ' + missingVals[i];
        } else if (i === 0) {
          errorString += ' ' + missingVals[i];
        } else {
          errorString += ', ' + missingVals[i];
        }
      }
      console.log(errorString);
    }
  }

  googleOAuthRedirect () {
    window.location.href = '/auth/google';
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
          <div className='login'>
            <h1>Login</h1>
            <TextField hintText='hello@world.com' floatingLabelText='Email' type='email' value={this.state.email} onChange={this.handleInputChange.bind(this, 'email')} /><br/>
            <TextField floatingLabelText='Password' type='password' value={this.state.password} onChange={this.handleInputChange.bind(this, 'password')} /><br/>
            <RaisedButton className='btn' onClick={this.sendLoginRequest}>Login</RaisedButton>
            <FlatButton className='btn' href='/signup'>Sign Up</FlatButton>
            <GoogleButton className='btn' onClick={this.googleOAuthRedirect} />
          </div>
      </MuiThemeProvider>
    ) 
  }
}

export default Login;