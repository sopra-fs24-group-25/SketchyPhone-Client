import { React, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import "../../styles/ui/DrawContainer.scss"
import { Button } from "./Button";
import { api, handleError } from "helpers/api";
import User from "../../models/User";
// Default draw container

// For more see:
// https://github.com/mdn/learning-area/blob/main/javascript/apis/drawing-graphics/loops_animation/8_canvas_drawing_app/script.js

//Also pass user and gameroom details as props in order to submit
export const AvatarDrawer = ({ height, width, user }) => {

    const navigate = useNavigate();
    const location = useLocation();

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

    let currentShape = Shapes.LINE; // Always start with line

    let submitted = false;

    const onMouseDown = (e) => {
        // Check if in range
        if (curX > 0 && curX < width && curY > 0 && curY < height) {

            pressed = true;
            newAction = true;

            initX = curX;
            initY = curY;
        }
    }

    const onMouseUp = () => {
        pressed = false;
        newAction = false;
    }

    const onMouseMove = (e) => {
        if (allowDraw) {
            try {
                curX = e.pageX - canvas.current.offsetLeft;
                curY = e.pageY - canvas.current.offsetTop;
            } catch {

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
                element.className = "drawContainer button selected"
            }
            else {
                element.className = "drawContainer button"
            }
        })

    }

    async function sendAvatar() {
        if (submitted) {
            console.log("Already successfully submitted");
            navigate("/join");

            return;
        }
        try {

            const base64Canvas = canvas.current.toDataURL("image/png").split(";base64,")[1];

            const requestBody = base64Canvas;
            const requestHeader = { "Authorization": user.token, "X-User-ID": user.userId };

            const url = `/users/${user.userId}/avatar/create`;
            const response = await api.post(url, requestBody, { headers: requestHeader });

            if (response.status === 201) {
                submitted = true;

                try{
                    // then set avatar id of user to newly created avatar
                    user.avatarId = response.data.avatarId + 6;

                    const userUpdateResponse = await api.put(`/users/${user.userId}`, user);

                    if(userUpdateResponse.data){
                        sessionStorage.setItem("user", JSON.stringify(userUpdateResponse.data));
                    }
                }
                catch(error){
                    console.log("Something went wrong went updating user with new avatarId: " + error);
                }

                // We pass the received isGameCreator to /join
                navigate("/join", { state: { isGameCreator: location.state.isGameCreator, view: "avatarView" }});
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
            
            return
        }

        let lastDrawnArray: [number, () => void][] = [[lastLineDrawn, () => lineDrawActions.pop()], [lastRectDrawn, () => rectangleDrawActions.pop()], [lastEllipseDrawn, () => ellipseDrawActions.pop()], [lastEraserDrawn, () => eraserDrawActions.pop()]];
        // sort in descending order
        lastDrawnArray.sort((a, b) => b[0] - a[0]);

        // pop the latest element
        lastDrawnArray[0][1]();
    }

    function initialize() {
        canvas.current = document.getElementById("canvas");

        if (canvas.current !== null) {
            ctx.current = (canvas.current as HTMLCanvasElement).getContext("2d");
        }
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
            clearBtn = document.getElementById("clearButton");

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
        await sendAvatar();
        submitted = true;
    }

    function drawRectangle() {
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

    function drawLine() {
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

    function utilizeEraser() {
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

    function drawEllipse() {
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

    const drawFunctionLine = (element) => {
        element.forEach(lineElement => {
            ctx.current.fillStyle = lineElement[1];
            ctx.current.lineWidth = lineElement[2];
            ctx.current.fill(lineElement[0]);
        });
    }

    const drawFunctionShapes = (element, shape) => {
        ctx.current.strokeStyle = element[0][1];
        ctx.current.fillStyle = element[0][1];
        ctx.current.lineWidth = element[0][2];
        if (element[0][3] === shape) {
            ctx.current.stroke(element[0][0]);
        }
        else {
            ctx.current.fill(element[0][0]);
        }
    }

    const drawFunctionEraser = (element) => {
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

    // Draw function where actual drawing is performed with context
    function draw() {
        if (pressed && allowDraw) {
            // Get values
            ctx.current.fillStyle = colorPicker.value;
            ctx.current.strokeStyle = colorPicker.value;
            ctx.current.lineWidth = sizePicker.value;


            if (currentShape.includes("RECTANGLE")) {
                drawRectangle();
            }
            else if (currentShape === Shapes.LINE) {
                drawLine();
            }
            else if (currentShape === Shapes.ERASER) {
                utilizeEraser();
            }
            else if (currentShape.includes("ELLIPSE")) {
                drawEllipse();
            }
        }

        let allActionsArraySorted: [number, () => void][] = []; // first index is the timestamp of the action, second the actual call

        ctx.current?.reset();


        // Standard compositeOperation
        ctx.current && (ctx.current.globalCompositeOperation = "source-over");

        // Here we draw all the line path elements
        lineDrawActions.forEach(element => {
            const timeStamp = element[element.length - 1][4];
            const drawFunction = () => {
                drawFunctionLine(element);
            };
            allActionsArraySorted.push([timeStamp, drawFunction]);
        });

        // Here we draw all the rectangle paths
        rectangleDrawActions.forEach(element => {
            const timeStamp = element[0][4];
            const drawFunction = () => {
                drawFunctionShapes(element, Shapes.RECTANGLE_EMPTY);
            }
            allActionsArraySorted.push([timeStamp, drawFunction]);
        });

        ellipseDrawActions.forEach(element => {
            const timeStamp = element[0][4];
            const drawFunction = () => {
                drawFunctionShapes(element, Shapes.ELLIPSE_EMPTY);
            }
            allActionsArraySorted.push([timeStamp, drawFunction]);
        });

        eraserDrawActions.forEach(element => {
            const timeStamp = element[element.length - 1][4];
            const drawFunction = () => {
                drawFunctionEraser(element);
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
            <div className="drawContainer">
                <h className="drawContainer textPrompt">Draw your own avatar!</h>
                <div className="drawContainer container">
                    <div className="drawContainer tools">
                        <label
                            className="drawContainer label"
                            htmlFor="color">Color
                        </label>
                        <input type="color" defaultValue={defaultColor}></input>
                        <label
                            className="drawContainer label"
                            htmlFor="brushSize">Brush Size
                        </label>
                        <input type="range" min="1" max="50" defaultValue="10" id="brushSize"></input>
                        <hr className="drawContainer separator" />
                        <button
                            className="drawContainer button selected"
                            id={Shapes.LINE}
                            onClick={() => onClickShapes(Shapes.LINE)}>
                            Line
                        </button>
                        <button
                            className="drawContainer button"
                            id={Shapes.RECTANGLE_SOLID}
                            onClick={() => onClickShapes(Shapes.RECTANGLE_SOLID)}>
                            Rectangle Solid
                        </button>
                        <button
                            className="drawContainer button"
                            id={Shapes.RECTANGLE_EMPTY}
                            onClick={() => onClickShapes(Shapes.RECTANGLE_EMPTY)}>
                            Rectangle Empty
                        </button>
                        <button
                            className="drawContainer button"
                            id={Shapes.ELLIPSE_SOLID}
                            onClick={() => onClickShapes(Shapes.ELLIPSE_SOLID)}>
                            Ellipse Solid
                        </button>
                        <button
                            className="drawContainer button"
                            id={Shapes.ELLIPSE_EMPTY}
                            onClick={() => onClickShapes(Shapes.ELLIPSE_EMPTY)}>
                            Ellipse Empty
                        </button>
                        <hr className="drawContainer separator" />
                        <button
                            className="drawContainer button"
                            id={Shapes.ERASER}
                            onClick={() => onClickShapes(Shapes.ERASER)}>
                            Eraser
                        </button>
                        <button
                            className="drawContainer button"
                            id="clearButton"
                            onClick={() => onButtonClear()}>
                            Clear Canvas
                        </button>

                    </div>
                    <div className="drawContainer subcontainer">
                        <canvas className="drawContainer drawCanvas" id="canvas" ref={canvas} height={height} width={width} />
                        <Button
                            width="20%"
                            onClick={() => onSubmit()}
                        >Submit</Button>

                    </div>
                </div>

            </div>
        </div >
    );
};
AvatarDrawer.propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    user: PropTypes.object,
};

export default AvatarDrawer;