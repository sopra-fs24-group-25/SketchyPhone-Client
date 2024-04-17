import { React, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import "../../styles/ui/DrawContainer.scss"
import { Button } from "./Button";
import { CountdownCircleTimer } from "react-countdown-circle-timer";


// Default draw container

// For more see:
// https://github.com/mdn/learning-area/blob/main/javascript/apis/drawing-graphics/loops_animation/8_canvas_drawing_app/script.js

//Also pass user and gameroom details as props in order to submit
export const DrawContainer = ({ height, width, textPrompt, timerDuration }) => {

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

    let allowDraw = true;

    let drawRect = false;

    let prevImageData;
    let submitImageData;
    let clearImage;

    let initialized = false;

    const onMouseDown = (e) => {
        // console.log("mouse pressed");
        // Check if in range
        if (curX > 0 && curX < width && curY > 0 && curY < height) {
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
        {
            curX = e.pageX - canvas.current.offsetLeft;
            curY = e.pageY - canvas.current.offsetTop;
        }
    }

    const onButtonClear = () => {
        if (ctx.current) {
            lineDrawActions = [];
            ctx.current.clearRect(0, 0, width, height);
        }
    }

    const onClickRect = () => {
        drawRect = !drawRect;
    }

    const onUndo = () => {
        // Undo last by checking timestamp
        let lastLineDrawn = -1;
        let lastRectDrawn = -1;

        if (lineDrawActions.length > 0) {
            let lastElementIndex = lineDrawActions[lineDrawActions.length - 1].length - 1;
            lastLineDrawn = lineDrawActions[lineDrawActions.length - 1][lastElementIndex][3];
        }

        if (rectangleDrawActions.length > 0) {
            lastRectDrawn = rectangleDrawActions[rectangleDrawActions.length - 1][0][3];
        }

        lastRectDrawn > lastLineDrawn ? rectangleDrawActions.pop() : lineDrawActions.pop();
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
        console.log("initializing");
        canvas.current = document.getElementById("canvas");

        if (canvas.current !== null) {
            ctx.current = (canvas.current as HTMLCanvasElement).getContext('2d');
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

            colorPicker = document.querySelector('input[type="color"]');
            sizePicker = document.querySelector('input[type="range"]');
            clearBtn = document.querySelector('button');

            // Add event listener for mouse move
            document.addEventListener("mousemove", onMouseMove);

            // Add event listener for mouse down
            document.addEventListener('mousedown', onMouseDown);

            // Add event listener for mouse up
            document.addEventListener('mouseup', onMouseUp);

            // Add event listener for undo
            document.addEventListener('keydown', function (event) {
                if (event.ctrlKey && event.key === 'z') {
                    onUndo();
                }
            });

            clearBtn.addEventListener('click', onButtonClear);
        }
    }, [])

    // covert degrees to radians
    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    };

    function onSave() {
        // Save image
        submitImageData = ctx.current.getImageData(0, 0, width, height);
    }

    function onSubmit() {
        // Create axios for submitting
        // alert("SUBMIT IMAGE");
        // allowDraw = false;
    }

    // Draw function where actual drawing is performed with context
    function draw() {
        if (pressed && allowDraw) {
            ctx.current.fillStyle = colorPicker.value;
            ctx.current.lineWidth = sizePicker.value;
            if (drawRect) {
                if (newAction) {
                    // We push an empty array
                    rectangleDrawActions.push([]);
                    newAction = false;
                }

                let newPath = new Path2D();

                newPath.rect(initX, initY, curX - initX, curY - initY);
                let rectangleDrawAction = [newPath, ctx.current.fillStyle, ctx.current.lineWidth, Date.now()]

                // Push it to last array
                if (rectangleDrawActions[rectangleDrawActions.length - 1].length === 0) {
                    rectangleDrawActions[rectangleDrawActions.length - 1].push(rectangleDrawAction);
                }
                else {
                    rectangleDrawActions[rectangleDrawActions.length - 1][0] = rectangleDrawAction;
                }

            }
            else {
                if (newAction) {
                    // We push an empty array
                    lineDrawActions.push([]);
                    newAction = false;
                }

                let newPath = new Path2D();

                newPath.arc(curX, curY, sizePicker.value, degToRad(0), degToRad(360), false);

                let lineDrawAction = [newPath, ctx.current.fillStyle, ctx.current.lineWidth, Date.now()]

                lineDrawActions[lineDrawActions.length - 1].push(lineDrawAction);
            }


        }

        ctx.current?.reset();
        lineDrawActions.forEach(element => {
            element.forEach(lineElement => {
                ctx.current.fillStyle = lineElement[1];
                ctx.current.lineWidth = lineElement[2];
                ctx.current.fill(lineElement[0]);
            });

        });

        rectangleDrawActions.forEach(element => {

            ctx.current.fillStyle = element[0][1];
            ctx.current.lineWidth = element[0][2];
            ctx.current.stroke(element[0][0]);
        });

        requestAnimationFrame(draw);


    };

    draw();


    return (
        <div>
            <div className="drawContainer" >
                <h className="drawContainer textPrompt">Hey! It is time to draw: {textPrompt}</h>
                <div className="drawContainer container">
                    <div className="drawContainer tools">
                        <input type="color" defaultValue={defaultColor}></input>
                        <label htmlFor="brushSize">Brush Size</label>
                        <input type="range" min="2" max="50" defaultValue="10" id="brushSize"></input>
                        <button>Clear Canvas</button>
                        <button onClick={() => onClickRect()}>Rectangle</button>
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
                            onUpdate={(remainingTime) => (remainingTime === 0 && onSubmit())}
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
    textPrompt: PropTypes.string,
    timerDuration: PropTypes.number
};
export default DrawContainer;