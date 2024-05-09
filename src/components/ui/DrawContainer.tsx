import { React, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import "../../styles/ui/DrawContainer.scss"
import { Button } from "./Button";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { api, handleError } from "helpers/api";
import GameLoopStatus from "../../helpers/gameLoopStatus"
import AudioContextEnum from "../../helpers/audioContextEnum";
import AudioPlayer from "../../helpers/AudioPlayer";
// Default draw container

// For more see:
// https://github.com/mdn/learning-area/blob/main/javascript/apis/drawing-graphics/loops_animation/8_canvas_drawing_app/script.js

//Also pass user and gameroom details as props in order to submit
export const DrawContainer = ({ height, width, user, game, textPrompt, timerDuration, setNextTask, setInitial }) => {

    const Shapes = {
        LINE: "LINE",
        RECTANGLE_EMPTY: "RECTANGLE_EMPTY",
        RECTANGLE_SOLID: "RECTANGLE_SOLID",
        ELLIPSE_EMPTY: "ELLIPSE_EMPTY",
        ELLIPSE_SOLID: "ELLIPSE_SOLID",
        ERASER: "ERASER"
    }

    const defaultColor = "#000000";
    const defaultBackgroundColor = "#FFFFFF"

    const canvas = useRef(null);
    const ctx = useRef(null);

    let colorPicker = useRef();
    let sizePicker = useRef();
    let clearBtn = useRef();

    let curX;
    let curY;

    let initX;
    let initY;
    let pressed = false;
    // If new action, action array is pushed with new element
    let newAction = false;

    let lineDrawActions = [];
    let rectangleDrawActions = [];
    let ellipseDrawActions = [];
    let eraserDrawActions = [];

    let allowDraw = true;

    let drawRect = false;

    let currentShape = Shapes.LINE; // Always start with line

    let initialized = false;

    let submitted = false;

    // For audio
    const timerSound = new AudioPlayer(AudioContextEnum.TIMER);



    const onMouseDown = (e) => {
        // Check if in range
        if (curX > 0 && curX < width && curY > 0 && curY < height) {
            console.log("mouse pressed");

            pressed = true;
            newAction = true;

            initX = curX;
            initY = curY;
        }

    }

    const onMouseUp = () => {
        // console.log("mouse up");
        pressed = false;
        newAction = false;
    }

    const onMouseMove = (e) => {
        if (allowDraw) {
            try {
                curX = e.pageX - canvas.current.offsetLeft;
                curY = e.pageY - canvas.current.offsetTop;
            } catch {
                //console.log("not yet ready")
            }
        }
    }

    const onButtonClear = () => {
        if (ctx.current && allowDraw) {
            // Remove all actions
            lineDrawActions = [];
            rectangleDrawActions = [];
            ellipseDrawActions = [];
            ctx.current.clearRect(0, 0, width, height);
        }
    }

    const onClickShapes = (shape) => {
        currentShape = shape;
        setFocusToActiveShapeButton();
    }

    const setFocusToActiveShapeButton = () => {
        // Performance wise maybe not the best
        const lineButton = document.getElementById(Shapes.LINE);
        const rectangleSolidButton = document.getElementById(Shapes.RECTANGLE_SOLID);
        const rectangleEmptyButton = document.getElementById(Shapes.RECTANGLE_EMPTY);
        const ellipseSolidButton = document.getElementById(Shapes.ELLIPSE_SOLID);
        const ellipseEmptyButton = document.getElementById(Shapes.ELLIPSE_EMPTY);
        const eraserButton = document.getElementById(Shapes.ERASER);

        const buttons = [lineButton, rectangleSolidButton, rectangleEmptyButton, ellipseSolidButton, ellipseEmptyButton, eraserButton];

        buttons.forEach((element) => {
            if (element.id === currentShape) {
                console.log(element.id)
                element.style.borderStyle = "solid"
            }
            else {
                element.style.borderStyle = "none"
            }
        })

    }

    async function sendImage() {
        if (submitted) {
            console.log("Already successfully submitted");

            return;
        }
        try {
            // Get last gamesession (will always be the current)
            let currentGameSessions = game.gameSessions;
            let idx = currentGameSessions.length - 1;
            let currentGameSessionId = currentGameSessions[idx].gameSessionId;

            // If we have a previous drawing id
            const previousTextPromptId = textPrompt.textPromptId;

            const base64Canvas = canvas.current.toDataURL("image/png").split(";base64,")[1];

            const requestBody = base64Canvas;
            const requestHeader = { "Authorization": user.token, "X-User-ID": user.userId };

            const url = `/games/${currentGameSessionId}/drawings/${user.userId}/${previousTextPromptId}`;
            console.log(url);
            const response = await api.post(url, requestBody, { headers: requestHeader });

            if (response.status === 201) {
                submitted = true;
            }

        }
        catch (error) {
            alert(
                `Something went wrong: \n${handleError(error)}`
            );
        }
    }

    const onUndo = () => {
        // Undo last by checking timestamp
        let lastLineDrawn = -1;
        let lastRectDrawn = -1;
        let lastEllipseDrawn = -1;
        let lastEraserDrawn = -1;


        if (lineDrawActions.length > 0) {
            let lastElementIndex = lineDrawActions[lineDrawActions.length - 1].length - 1;
            lastLineDrawn = lineDrawActions[lineDrawActions.length - 1][lastElementIndex][4];
        }

        if (rectangleDrawActions.length > 0) {
            lastRectDrawn = rectangleDrawActions[rectangleDrawActions.length - 1][0][4];
        }

        if (ellipseDrawActions.length > 0) {
            lastEllipseDrawn = ellipseDrawActions[ellipseDrawActions.length - 1][0][4];
        }

        if (eraserDrawActions.length > 0) {
            lastEraserDrawn = eraserDrawActions[eraserDrawActions.length - 1][0][4];
        }

        if (lastLineDrawn + lastEllipseDrawn + lastRectDrawn + lastEraserDrawn === -4) {
            console.log("nothing to undo");

            return
        }

        let lastDrawnArray: [number, () => void][] = [[lastLineDrawn, () => lineDrawActions.pop()], [lastRectDrawn, () => rectangleDrawActions.pop()], [lastEllipseDrawn, () => ellipseDrawActions.pop()], [lastEraserDrawn, () => eraserDrawActions.pop()]];
        // sort in descending order
        lastDrawnArray.sort((a, b) => b[0] - a[0]);

        // pop the latest element
        lastDrawnArray[0][1]();
    }

    // TIMER https://github.com/vydimitrov/react-countdown-circle-timer/tree/master/packages/web#readme
    const timerProps = {
        isPlaying: true,
        size: 60,
        strokeWidth: 6
    };

    const minuteSeconds = 60;

    const startTime = Date.now() / 1000; // use UNIX timestamp in seconds
    const endTime = startTime + timerDuration; // use UNIX timestamp in seconds

    const remainingTime = endTime - startTime;

    const getTimeSeconds = (time) => (minuteSeconds - time) | 0;


    function initialize() {
        canvas.current = document.getElementById("canvas");

        if (canvas.current !== null) {
            ctx.current = (canvas.current as HTMLCanvasElement).getContext("2d");
        }

        initialized = (canvas.current !== null && ctx.current !== null);

    }

    useEffect(() => {
        if (canvas.current === null || ctx.current === null) {
            initialize();

            ctx.current.fillStyle = defaultBackgroundColor;
            ctx.current.fillRect(0, 0, width, height);
            // Save initial image for resetting
            ctx.current.save();

            colorPicker = document.querySelector("input[type='color']");
            sizePicker = document.querySelector("input[type='range']");
            clearBtn = document.querySelector("button");

            // Add event listener for mouse move
            document.addEventListener("mousemove", onMouseMove);

            // Add event listener for mouse down
            document.addEventListener("mousedown", onMouseDown);

            // Add event listener for mouse up
            document.addEventListener("mouseup", onMouseUp);

            // Add event listener for undo
            document.addEventListener("keydown", function (event) {
                if (event.ctrlKey && event.key === "z") {
                    onUndo();
                }
            });

            clearBtn.addEventListener("click", onButtonClear);
        }
    }, [])

    // covert degrees to radians
    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    };

    async function onSubmit() {
        allowDraw = false;
        await sendImage();
        setInitial(false);
        submitted = true;
        setNextTask(GameLoopStatus.TEXTPROMPT);
        // Also set button to deactivated
    }

    async function onTimerEnd() {
        if (!submitted) {
            await onSubmit();
        }
    }

    // Draw function where actual drawing is performed with context
    function draw() {
        if (pressed && allowDraw) {
            // Get values
            ctx.current.fillStyle = colorPicker.value;
            ctx.current.strokeStyle = colorPicker.value;
            ctx.current.lineWidth = sizePicker.value;

            if (currentShape.includes("RECTANGLE")) {
                if (newAction) {
                    // We push an empty array
                    rectangleDrawActions.push([]);
                    newAction = false;
                }

                let newPath = new Path2D();

                newPath.rect(initX, initY, curX - initX, curY - initY);

                let rectangleDrawAction;

                if (currentShape === Shapes.RECTANGLE_EMPTY) {
                    rectangleDrawAction = [newPath, ctx.current.fillStyle, ctx.current.lineWidth, Shapes.RECTANGLE_EMPTY, Date.now()]
                }
                else if (currentShape === Shapes.RECTANGLE_SOLID) {
                    rectangleDrawAction = [newPath, ctx.current.fillStyle, ctx.current.lineWidth, Shapes.RECTANGLE_SOLID, Date.now()]
                }

                // Push it to last array
                if (rectangleDrawActions[rectangleDrawActions.length - 1].length === 0) {
                    rectangleDrawActions[rectangleDrawActions.length - 1].push(rectangleDrawAction);
                }
                else {
                    rectangleDrawActions[rectangleDrawActions.length - 1][0] = rectangleDrawAction;
                }

            }
            else if (currentShape === Shapes.LINE) {
                if (newAction) {
                    // We push an empty array
                    lineDrawActions.push([]);
                    newAction = false;
                }

                let newPath = new Path2D();

                newPath.arc(curX, curY, sizePicker.value, degToRad(0), degToRad(360), false);

                let lineDrawAction = [newPath, ctx.current.fillStyle, ctx.current.lineWidth, Shapes.LINE, Date.now()]

                lineDrawActions[lineDrawActions.length - 1].push(lineDrawAction);
            }
            else if (currentShape === Shapes.ERASER) {
                if (newAction) {
                    // We push an empty array
                    eraserDrawActions.push([]);
                    newAction = false;
                }

                let newPath = new Path2D();

                newPath.arc(curX, curY, sizePicker.value, degToRad(0), degToRad(360), false);

                // use transparent fill
                let eraserDrawAction = [newPath, "rgba(0,0,0,1)", ctx.current.lineWidth, Shapes.ERASER, Date.now()]

                eraserDrawActions[eraserDrawActions.length - 1].push(eraserDrawAction);
            }
            else if (currentShape.includes("ELLIPSE")) {
                if (newAction) {
                    // We push an empty array
                    ellipseDrawActions.push([]);
                    newAction = false;
                }
                let newPath = new Path2D();


                newPath.ellipse((initX + curX) / 2, (initY + curY) / 2, Math.abs((curX - initX) / 2), Math.abs((curY - initY) / 2), 0, 0, Math.PI * 2);
                let ellipseDrawAction;

                if (currentShape === Shapes.ELLIPSE_EMPTY) {
                    ellipseDrawAction = [newPath, ctx.current.fillStyle, ctx.current.lineWidth, Shapes.ELLIPSE_EMPTY, Date.now()]
                }
                else if (currentShape === Shapes.ELLIPSE_SOLID) {
                    ellipseDrawAction = [newPath, ctx.current.fillStyle, ctx.current.lineWidth, Shapes.ELLIPSE_SOLID, Date.now()]
                }

                // Push it to last array
                if (ellipseDrawActions[ellipseDrawActions.length - 1].length === 0) {
                    ellipseDrawActions[ellipseDrawActions.length - 1].push(ellipseDrawAction);
                }
                else {
                    ellipseDrawActions[ellipseDrawActions.length - 1][0] = ellipseDrawAction;
                }
            }


        }

        let allActionsArraySorted: [number, () => void][] = []; // first index is the timestamp of the action, second the actual call

        ctx.current?.reset();

        // Standard compositeOperation
        ctx.current && (ctx.current.globalCompositeOperation = "source-over");

        // TODO: Should draw them in order they were drawn
        // Here we draw all the line path elements
        lineDrawActions.forEach(element => {
            const timeStamp = element[element.length - 1][4];
            const drawFunction = () => {
                element.forEach(lineElement => {
                    ctx.current.fillStyle = lineElement[1];
                    ctx.current.lineWidth = lineElement[2];
                    ctx.current.fill(lineElement[0]);
                });
            };
            allActionsArraySorted.push([timeStamp, drawFunction]);
        });


        // Here we draw all the rectangle paths
        rectangleDrawActions.forEach(element => {
            const timeStamp = element[0][4];
            const drawFunction = () => {
                ctx.current.strokeStyle = element[0][1];
                ctx.current.fillStyle = element[0][1];
                ctx.current.lineWidth = element[0][2];
                if (element[0][3] === Shapes.RECTANGLE_EMPTY) {
                    ctx.current.stroke(element[0][0]);
                }
                else {
                    ctx.current.fill(element[0][0]);
                }
            }
            allActionsArraySorted.push([timeStamp, drawFunction]);
        });

        ellipseDrawActions.forEach(element => {
            const timeStamp = element[0][4];
            const drawFunction = () => {
                ctx.current.strokeStyle = element[0][1];
                ctx.current.fillStyle = element[0][1];
                ctx.current.lineWidth = element[0][2];
                if (element[0][3] === Shapes.ELLIPSE_EMPTY) {
                    ctx.current.stroke(element[0][0]);
                }
                else {
                    ctx.current.fill(element[0][0]);
                }
            }
            allActionsArraySorted.push([timeStamp, drawFunction]);
        });

        eraserDrawActions.forEach(element => {
            const timeStamp = element[element.length - 1][4];
            const drawFunction = () => {
                // Set compositeOperation to set transparent where pixels overlap
                ctx.current.globalCompositeOperation = "destination-out";
                element.forEach(eraserElement => {
                    ctx.current.fillStyle = "rbga(0,0,0,1)";
                    ctx.current.strokeStyle = "rbga(0,0,0,1)";
                    ctx.current.lineWidth = eraserElement[2];
                    ctx.current.fill(eraserElement[0]);
                });
                ctx.current.globalCompositeOperation = "source-over";
            }
            allActionsArraySorted.push([timeStamp, drawFunction]);
        })


        allActionsArraySorted.sort((a, b) => (a[0] - b[0]))
        allActionsArraySorted.forEach(element => {
            element[1]();
        });

        // Reset compositeoperation
        ctx.current && (ctx.current.globalCompositeOperation = "source-over");

        requestAnimationFrame(draw);
    };

    draw();


    return (
        <div>
            <div className="drawContainer" >
                <h className="drawContainer textPrompt">Hey! It&apos;s time to draw: {textPrompt.content}</h>
                <div className="drawContainer container">
                    <div className="drawContainer tools">
                        <label htmlFor="color">Color
                        </label>
                        <input type="color" defaultValue={defaultColor}></input>
                        <label htmlFor="brushSize">Brush Size</label>
                        <input type="range" min="1" max="50" defaultValue="10" id="brushSize"></input>
                        <hr
                            style={{
                                background: "white",
                                color: "white",
                                borderColor: "white",
                                height: "2px",
                                width: "100%"
                            }}
                        />
                        <button
                            id={Shapes.LINE}
                            onClick={() => onClickShapes(Shapes.LINE)}>
                            Line
                        </button>
                        <button
                            id={Shapes.RECTANGLE_SOLID}
                            onClick={() => onClickShapes(Shapes.RECTANGLE_SOLID)}>
                            Rectangle Solid
                        </button>
                        <button
                            id={Shapes.RECTANGLE_EMPTY}
                            onClick={() => onClickShapes(Shapes.RECTANGLE_EMPTY)}>
                            Rectangle Empty
                        </button>

                        <button
                            id={Shapes.ELLIPSE_SOLID}
                            onClick={() => onClickShapes(Shapes.ELLIPSE_SOLID)}>
                            Ellipse Solid
                        </button>
                        <button
                            id={Shapes.ELLIPSE_EMPTY}
                            onClick={() => onClickShapes(Shapes.ELLIPSE_EMPTY)}>
                            Ellipse Empty
                        </button>

                        <hr
                            style={{
                                background: "white",
                                color: "white",
                                borderColor: "white",
                                height: "2px",
                                width: "100%"
                            }}
                        />
                        <button
                            id={Shapes.ERASER}
                            onClick={() => onClickShapes(Shapes.ERASER)}>
                            Eraser
                        </button>
                        <button onClick={() => onButtonClear()}>Clear Canvas</button>

                    </div>
                    <div className="drawContainer subcontainer">
                        <canvas className="drawContainer drawCanvas" id="canvas" ref={canvas} height={height} width={width} />
                        <Button
                            width="20%"
                            onClick={() => onSubmit()}
                        >Submit</Button>

                    </div>
                    <div className="drawContainer timer">
                        <CountdownCircleTimer
                            {...timerProps}
                            colors="#000000"
                            duration={timerDuration}
                            initialRemainingTime={remainingTime & minuteSeconds}
                            onComplete={(totalElapsedTime) => ({ shouldRepeat: false })}

                            // Here submit if timer ran out
                            onUpdate={(remainingTime) => { (remainingTime === 0 && onTimerEnd()), (remainingTime === 10 && timerSound.handlePlay()) }}
                        >
                        </CountdownCircleTimer>
                    </div>
                </div>

            </div>
        </div >
    );
};
DrawContainer.propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    user: PropTypes.object.isRequired,
    game: PropTypes.object.isRequired,
    textPrompt: PropTypes.object,
    timerDuration: PropTypes.number,
    setNextTask: PropTypes.func,
    setInitial: PropTypes.func,
};

export default DrawContainer;