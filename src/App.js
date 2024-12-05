<<<<<<< HEAD
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme"; 
import Signup from "./components/Auth/SignupPage"; 
import SignIn from "./components/Auth/SignInPage"; 
import ForgetPassword from "./components/Auth/ForgetPassword"; 
import Home from "./components/Home/Home"; 

const App = () => {
  const [isLoggedIn, setLoggedIn] = useState(false); 

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/signup" element={<Signup setLoggedIn={setLoggedIn} />} />

        <Route path="/signin" element={<SignIn setLoggedIn={setLoggedIn} />} />

        <Route path="/forget-password" element={<ForgetPassword />} />

        {/* Home Route - Redirect to SignIn if not logged in */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Home />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
      </Routes>
    </ThemeProvider>
  );
};
=======
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
>>>>>>> 88f174cd8877f6a867e8e1c368b681b4ee948119

export default App;
