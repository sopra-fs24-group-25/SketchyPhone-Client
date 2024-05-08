import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "components/ui/Button";
import { GuideButton } from "components/ui/GuideButton";
import "styles/views/Start.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import Header from "./Header";


const GuideField = (props) => {
    return (
        <div className="start guide"
            onClick={() => props.onClick()}
            style={props.index !== 5 ? {cursor: "pointer"} : null}
        >
            <h2>Quick Guide to the Game</h2>
            <h1>{props.index}.</h1>
            <h2 style={{"textAlign": "center"}}>{Guide[`${props.index}`]}</h2>
        </div>
    );
};

GuideField.propTypes = {
    onClick: PropTypes.func,
    index: PropTypes.number
};

const Guide = {
    "1": "Calling is better! Invite your friends to a voice call.",
    "2": "Each player must write a quirky sentence for others to draw.",
    "3": "You will receive someone's bizarre sentence to draw.",
    "4": "Try to describe someone's crazy drawing.",
    "5": "Watch the hilarious results of your Sketchy Phone game."
}

const Start = () => {

    const navigate = useNavigate();
    const [guide, setGuide] = useState<number>(1);

    const doLogin = (): void => {
        navigate("/login", { state: {isSignUp: false}});
    };

    const doPlayGuest = async () => {
        navigate("/gameRoom");
    };

    const doSignUp = (): void => {
        navigate("/login", { state: {isSignUp: true}});
    };

    const getGuideButtons = () => {
        const array = [1, 2, 3, 4, 5];
        
        return array.map((n) => (
            <GuideButton
                key={n}
                className={guide === n ? "active" : "inactive"}
                onClick={() => setGuide(n)}
            ></GuideButton>
        ));
    }

    const nextGuide = () => {
        if (guide === 5) {
            return;
        }
        setGuide(guide + 1);
    }

    return (
        <div className="start container">
            <Header></Header>
            <BaseContainer>
                <div className="start sub-container">
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
                                onClick={() => doPlayGuest()}
                            >
                                Play as a guest
                            </Button>
                        </div>
                        <div className="start button-container">
                            <Button
                                width="100%"
                                onClick={() => doSignUp()}
                            >
                                Sign up
                            </Button>
                        </div>
                        <button className="start sign-in-link"
                            onClick={() => doLogin()}>
                            Already have an account? Log in
                        </button>
                    </div>
                    <div className="start box">
                        <div className="guide-container">
                            <GuideField
                                index={guide}
                                onClick={() => nextGuide()}>
                            </GuideField>
                            <div className="start guide-container">
                                {getGuideButtons()}
                            </div>
                        </div>
                    </div>
                </div>
            </BaseContainer>
        </div>
    );
};


export default Start;
