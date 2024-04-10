import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import User from "models/User";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/Login.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";

/*
It is possible to add multiple components inside a single file,
however be sure not to clutter your files with an endless amount!
As a rule of thumb, use one file per component and only add small,
specific components that belong to the main one in the same file.
 */
const FormField = (props) => {
    return (
        <div className="login field">
            <label className="login label">{props.label}</label>
            <input
                className="login input"
                placeholder={props.placeholder}
                value={props.value}
                type={props.type}
                onChange={(e) => props.onChange(e.target.value)}
            />
        </div>
    );
};

FormField.propTypes = {
    label: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    type: PropTypes.string,
    onChange: PropTypes.func,
};

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<Boolean>(false);

    const doLogin = async () => {
        try {
            const name = password // temporary to get it to work
            const requestBody = JSON.stringify({ username, name });
            const response = await api.post("/users", requestBody); //will change in future: post /login

            // Get the returned user and update a new object.
            const user = new User(response.data);

            // Store the token into the local storage.
            localStorage.setItem("token", user.token);

            // Login successfully worked --> navigate to the route /game in the GameRouter
            navigate("/GameRoom");
        } catch (error) {
            alert(
                `Something went wrong during the login: \n${handleError(error)}`
            );
        }
    };

    return (
        <BaseContainer>
            <div className="login container">
                <div className="login form">
                    <FormField
                        label="Username"
                        placeholder="Username"
                        value={username}
                        onChange={(un: string) => setUsername(un)}
                    />
                    <FormField
                        label="Password"
                        placeholder="Password"
                        value={password}
                        type={showPassword ? "text" : "password"}
                        onChange={(p: string) => setPassword(p)}
                    />
                    <Button //change formatting in future
                        onClick={() => setShowPassword(!showPassword)}
                        width="10%">
                    </Button>
                    <div className="login button-container">
                        <Button
                            disabled={!username || !password}
                            width="100%"
                            onClick={() => doLogin()}
                        >
                            Login
                        </Button>
                    </div>
                </div>
            </div>
        </BaseContainer>
    );
};

/**
 * You can get access to the history object's properties via the useLocation, useNavigate, useParams, ... hooks.
 */
export default Login;
