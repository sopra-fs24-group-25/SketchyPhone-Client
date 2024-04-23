import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import { Button } from "components/ui/Button";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import { BackButton } from "components/ui/BackButton";
import { BurgerMenu } from "components/ui/BurgerMenu";
import PropTypes from "prop-types";
import "styles/views/GameSettings.scss";
import "styles/ui/ChubbyGuy.scss";
import User from "models/User";


const GameSettings = () => {
    const navigate = useNavigate();

    // Store default values
    const [numCycles, setNumCycles] = useState(sessionStorage.getItem("numCycles")); // will default to first option when null
    const [timeLimit, setTimeLimit] = useState<String>(sessionStorage.getItem("timeLimit"));
    const [isEnabledTTS, setIsEnabledTTS] = useState(JSON.parse(sessionStorage.getItem("isEnabledTTS"))); // Need to parse it otherwise will stay true for any string
    const [isAdmin, setIsAdmin] = useState(true); // Should change to false by default just for testing

    const onSettingsSave = async () => {
        // First send data to server then navigate back

        // Store to sessionstorage
        sessionStorage.setItem("numCycles", numCycles);
        sessionStorage.setItem("timeLimit", timeLimit);
        sessionStorage.setItem("isEnabledTTS", isEnabledTTS);

        alert("Settings saved")


        // navigate("/gameroom")
    }

    useEffect(() => {
    });

    return (
        <BaseContainer>
            <div className="settings header">
                <BurgerMenu></BurgerMenu> {/* ADD menu functionality*/}
            </div>
            <BackButton onClick={() => navigate("/gameroom")}></BackButton>
            <div className="settings container">
                <h1>Settings</h1>

                {/* TODO: fetch stored values from sessionstorage*/}
                <div className="settings options-container">
                    <div className="settings option">
                        <label htmlFor="numCycles">Number of cycles:</label>

                        <select
                            name="numCycles"
                            value={numCycles}
                            defaultValue={numCycles}
                            id="numCycles"
                            onChange={(e) => setNumCycles(e.target.value)}
                        >
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                            <option value={6}>6</option>
                        </select>
                    </div>
                    <div className="settings option">
                        <label htmlFor="timeLimit">Time limit per action:</label>

                        <select
                            name="timeLimit"
                            value={timeLimit}
                            defaultValue={timeLimit}
                            id="timeLimit"
                            onChange={(e) => setTimeLimit(e.target.value)}
                        >
                            <option value="normal">normal</option>
                            <option value="relaxed">relaxed</option>
                            <option value="quick">quick</option>
                        </select>
                    </div>
                    <div className="settings option">
                        <label htmlFor="text-to-speech">Enable text-to-speech:</label>
                        <label className="switch" >
                            <input
                                type="checkbox"
                                checked={isEnabledTTS}
                                value = {isEnabledTTS}
                                onChange={(e) => setIsEnabledTTS(e.target.checked)}
                                id="text-to-speech"></input>
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>
                <Button
                    width="10%"
                    onClick={() => onSettingsSave()}>
                    Save</Button>

            </div>
        </BaseContainer>
    );
}

export default GameSettings;