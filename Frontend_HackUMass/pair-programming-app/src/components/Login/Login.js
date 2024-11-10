import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const navigate = useNavigate();

  const handleEmailPasswordAuth = async (event) => {
    event.preventDefault();

    if (isRegistering && password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Registration successful!");
        navigate("/dashboard");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful!");
        navigate("/dashboard");
      }
    } catch (error) {
      if (isRegistering && error.code === "auth/email-already-in-use") {
        setEmailError("Username already exists.");
      } else if (error.code === "auth/wrong-password") {
        setPasswordError("Incorrect password.");
      } else if (error.code === "auth/user-not-found") {
        setEmailError("No account found with this email.");
      } else {
        console.error("Authentication error:", error);
        alert("Error");
      }
    }
  };

  return (
    <div className="background" style={{
        backgroundImage: `url(${process.env.PUBLIC_URL + "/images/codeIm.png.webp"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
      <div className="login-container">
      <h2>{isRegistering ? "Register" : "Login"}</h2>
        <form onSubmit={handleEmailPasswordAuth}>
          <div className="input-group">
            <label>
              Email:
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Password:
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {isRegistering && (
              <label>
                Confirm Password:
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {confirmPasswordError && <span className="error-message">{confirmPasswordError}</span>}
              </label>
            )}
          </div>
          {emailError && <span className="error-message">{emailError}</span>}
          {passwordError && <span className="error-message">{passwordError}</span>}
          <button type="submit">{isRegistering ? "Register" : "Login"}</button>
        </form>
        <Link className="link" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
        </Link>
      </div>
    </div>
  );
}

export default Login;
