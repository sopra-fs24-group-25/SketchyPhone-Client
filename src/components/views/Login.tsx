import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import User from "models/User";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "styles/views/Login.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import Header from "./Header";


const FormField = (props) => {
    return (
        <div className="login field">
            <label className="login label">{props.label}</label>
            <div className="password-field">
                <input
                    className={`login input ${props.disabled ? "invalid" : ""}`}
                    placeholder={props.placeholder}
                    style={{ userSelect: "none" }}
                    value={props.value}
                    type={props.type}
                    onChange={(e) => props.onChange(e.target.value)}
                    disabled={props.disabled}
                />
                {props.disabled ? null :<FontAwesomeIcon
                    icon={props.buttonEye}
                    color="black"
                    className="password-toggle-icon"
                    onClick={props.onTogglePasswordVisibility}
                />}
            </div>
        </div>
    );
};

FormField.propTypes = {
    label: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    type: PropTypes.string,
    onChange: PropTypes.func,
    showPassword: PropTypes.bool,
    onTogglePasswordVisibility: PropTypes.func,
    buttonEye: PropTypes.object,
    disabled: PropTypes.bool,
};

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [username, setUsername] = useState<String>("");
    const [password, setPassword] = useState<String>("");
    const [confirmPassword, setConfirmPassword] = useState<String>("");
    const [showPassword, setShowPassword] = useState<Boolean>(false);
    const [credentialsInvalid, setCredentialsInvalid] = useState<Boolean>(false);
    const [isSignUp, setIsSignUp] = useState<Boolean>(location.state.isSignUp);

    const doLogin = async () => { //needs to handle login and sign-up in future (or separate in two functions)
        try {
            const requestBody = JSON.stringify({ nickname: username, password });
            const response = await api.post("/users", requestBody); //will change in future: post /login

            // Get the returned user and update a new object.
            const user = new User(response.data);

            // Store the token into the local storage.
            sessionStorage.setItem("token", user.token);
            sessionStorage.setItem("user", JSON.stringify(user));

            // Login successfully worked --> navigate to the route /game in the GameRouter
            navigate("/gameRoom");
        } catch (error) {
            setCredentialsInvalid(true);
            await new Promise((resolve) => setTimeout(resolve, 500));
            setShowPassword(true);
            setUsername("Invalid Username!");
            setPassword("Invalid Password!");
            setConfirmPassword("Invalid Password!");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setCredentialsInvalid(false);
            setShowPassword(false);
            setUsername("");
            setPassword("");
            setConfirmPassword("");
            //alert(
            //    `Something went wrong during the login: \n${handleError(error)}`
            //);
        }
    };

    const switchLoginMethod = () => {
        if (credentialsInvalid) {
            return;
        }
        setIsSignUp(!isSignUp);
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setShowPassword(false);
    }

    return (
        <div className="login header">
            <Header></Header>
            <BaseContainer>
                <div className="login container">
                    <div className="login form">
                        <FormField
                            label="Username"
                            placeholder="Username"
                            value={username}
                            onChange={(un) => setUsername(un)}
                            disabled={credentialsInvalid}
                        />
                        <FormField
                            label="Password"
                            placeholder="Password"
                            value={password}
                            type={showPassword ? "text" : "password"}
                            onChange={(p) => setPassword(p)}
                            showPassword={showPassword}
                            disabled={credentialsInvalid}
                            onTogglePasswordVisibility={() => setShowPassword(!showPassword)}
                            buttonEye={!showPassword ? faEye : faEyeSlash}
                        />
                        {isSignUp ? (
                            <FormField
                                label="Confirm Password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                type={showPassword ? "text" : "password"}
                                onChange={(p) => setConfirmPassword(p)}
                                showPassword={showPassword}
                                disabled={credentialsInvalid}
                                onTogglePasswordVisibility={() => setShowPassword(!showPassword)}
                                buttonEye={!showPassword ? faEye : faEyeSlash}
                            />
                        ) : null}
                        <div className="login button-container">
                            <Button
                                disabled={!username || !password || (password !== confirmPassword && isSignUp)}
                                width="100%"
                                onClick={() => doLogin()}
                            >
                                {isSignUp ? "Sign up" : "Login"}
                            </Button>
                        </div>
                        <div className={`login sign-in-link ${credentialsInvalid ? "locked" : ""}`}
                            onClick={() => switchLoginMethod()}>
                            {isSignUp ? "Already have an account? Log in" : "Don't have an account yet? Sign up"}
                        </div>
                    </div>
                </div>
            </BaseContainer>
        </div>
    );
};

export default Login;
