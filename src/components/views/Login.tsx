import React, { useState } from "react";
import { api } from "helpers/api";
import User from "models/User";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "components/ui/Button";
import { BackButton } from "components/ui/BackButton";
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
    onTogglePasswordVisibility: PropTypes.func,
    buttonEye: PropTypes.object,
    disabled: PropTypes.bool,
};

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [credentialsInvalid, setCredentialsInvalid] = useState<boolean>(false);
    const [isSignUp, setIsSignUp] = useState<boolean>(location.state?.isSignUp ?? true);
    const [toCreateAccount] = useState<boolean>(location.state?.toCreateAccount ?? false);

    const doLogin = async (isSignUp) => {
        try {
            const requestBody = JSON.stringify({ nickname: username, username, password, persistent: true });
            let response;
            if (isSignUp) {
                response = await api.post("/signUp", requestBody);
            } else {
                response = await api.post("/logIn", requestBody);
            }

            // Get the returned user and update a new object.
            const user = new User(response.data);

            // Store the token into the local storage.
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
        }
    };

    function goBack() {
        if (toCreateAccount) {
            navigate("/gameRoom");
        } else {
            sessionStorage.clear();
            navigate("/");
        }
    }

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
                                onClick={() => doLogin(isSignUp)}
                            >
                                {isSignUp ? "Sign up" : "Login"}
                            </Button>
                        </div>
                        <button className={`login sign-in-link ${credentialsInvalid ? "locked" : ""}`}
                            onClick={() => switchLoginMethod()}>
                            {isSignUp ? "Already have an account? Log in" : "Don't have an account yet? Sign up"}
                        </button>
                    </div>
                    <BackButton className="menu-backbutton"
                        onClick={() => goBack()}>
                    </BackButton>
                </div>
            </BaseContainer>
        </div>
    );
};

export default Login;
