import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import User from "models/User";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import { GuideButton } from "components/ui/GuideButton";
import "styles/views/Start.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import Guide from "./Guide.json"
import Header from "./Header";

/*
It is possible to add multiple components inside a single file,
however be sure not to clutter your files with an endless amount!
As a rule of thumb, use one file per component and only add small,
specific components that belong to the main one in the same file.
 */

const GuideField = (props) => {
    return (
        <div className="start guide">
            <h2>Quick Guide to the Game</h2>
            <h1>{props.index}.</h1>
            <h2 style={{"text-align": "center"}}>{Guide[`${props.index}`]}</h2>
        </div>
    );
};

GuideField.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onClick: PropTypes.func,
    index: PropTypes.number
};

const Start = () => {
    const navigate = useNavigate();
    const [guide, setGuide] = useState<number>(1);
    const [toggle, setToggle] = useState<number>(1);

    const doLogin = (): void => {
        navigate("/login");
    };

    const doPlayGuest = (): void => {
        navigate("/login");
    };

    const doSignUp = (): void => {
        navigate("/signup");
    };

    const handleGuide = (i: number): void => {
        setGuide(i);
    }

    const handleToggle = (i: number): void => {
        setToggle(i);
    }

    return (
        <div className="start container">
            <Header></Header>
            <BaseContainer>
                <div className="start subcontainer">
                    <div className="start box">
                        <h2>
                            Log in to save results!
                        </h2>
                        <div>
                            Log in or sign up to view albums after the 
                            game, or continue as a guest without access to results!
                        </div>
                        <div className="start button-container">
                            <Button
                                width="100%"
                                onClick={() => doLogin()}
                            >
                                Play as a guest
                            </Button>
                        </div>
                        <div className="start button-container">
                            <Button
                                width="100%"
                                onClick={() => doLogin()}
                            >
                                Sign up
                            </Button>
                        </div>
                        <div className="start sign-in-link"
                            onClick={() => doPlayGuest()}>
                            Already have an account? Log in
                        </div>
                    </div>
                    <div className="start box">
                        <div className="guide-container">
                            <GuideField index={guide}></GuideField>
                            <div className="start guide-container">
                                <GuideButton
                                    className={guide === 1 ? "active" : "inactive"}
                                    onClick={() => handleGuide(1)}
                                >
                                </GuideButton>
                                <GuideButton
                                    className={guide === 2 ? "active" : "inactive"}
                                    onClick={() => handleGuide(2)}
                                >
                                </GuideButton>
                                <GuideButton
                                    className={guide === 3 ? "active" : "inactive"}
                                    onClick={() => handleGuide(3)}
                                >
                                </GuideButton>
                                <GuideButton
                                    className={guide === 4 ? "active" : "inactive"}
                                    onClick={() => handleGuide(4)}
                                >
                                </GuideButton>
                                <GuideButton
                                    className={guide === 5 ? "active" : "inactive"}
                                    onClick={() => handleGuide(5)}
                                >
                                </GuideButton>
                            </div>
                        </div>
                    </div>
                </div>
            </BaseContainer>
        </div>
    );
};

/**
 * You can get access to the history object's properties via the useLocation, useNavigate, useParams, ... hooks.
 */
export default Start;
