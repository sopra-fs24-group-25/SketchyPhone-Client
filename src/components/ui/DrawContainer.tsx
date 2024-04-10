import { React, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import "../../styles/ui/DrawContainer.scss"

// Default draw container

// For more see:
// https://github.com/mdn/learning-area/blob/main/javascript/apis/drawing-graphics/loops_animation/8_canvas_drawing_app/script.js
export const DrawContainer = ({ height, width }) => {

    const defaultColor = "#000000";
    const defaultBackgroundColor = "#FFFFFF"

    let canvas = useRef(null);
    let ctx = useRef(null);

    let colorPicker = useRef();
    let sizePicker = useRef();
    let clearBtn = useRef();

    let curX;
    let curY;

    let initX;
    let initY;
    let pressed = false;

    let drawRect = false;

    let prevImageData;

    const onMouseDown = (e) => {
        // console.log("mouse pressed");
        pressed = true;
        initX = curX;
        initY = curY;
    }

    const onMouseUp = () => {
        // console.log("mouse up");
        pressed = false;

    }

    const onMouseMove = (e) => {
        {
            curX = e.pageX - canvas.offsetLeft;
            curY = e.pageY - canvas.offsetTop;
        }
    }

    const onButtonClear = () => {
        ctx.reset();
    }

    const onClickRect = () => {
        prevImageData = ctx.getImageData(0, 0, width, height);
        drawRect = !drawRect;
        console.log(drawRect);
    }


    useEffect(() => {
        if (canvas.current === null || ctx.current === null) {

            canvas = document.getElementById("canvas");
            ctx = (canvas as HTMLCanvasElement).getContext('2d');

            ctx.fillStyle = defaultBackgroundColor;
            ctx.fillRect(0, 0, width, height);
            ctx.save();

            colorPicker = document.querySelector('input[type="color"]');
            sizePicker = document.querySelector('input[type="range"]');
            clearBtn = document.querySelector('button');

            // Add event listener for mouse move
            document.addEventListener("mousemove", onMouseMove);

            // Add event listener for mouse down
            (canvas as HTMLCanvasElement).addEventListener('mousedown', onMouseDown);

            // Add event listener for mouse up
            (canvas as HTMLCanvasElement).addEventListener('mouseup', onMouseUp);

            clearBtn.addEventListener('click', onButtonClear);
        }
    }, [])

    // covert degrees to radians
    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    };

    // Draw function where actual drawing is performed with context
    function draw() {
        if (pressed) {
            if (drawRect) {
                // Not working properly
                ctx.reset();
                if (prevImageData) {
                    ctx.putImageData(prevImageData, 0, 0);
                }
                ctx.rect(initX, initY, curX - initX, curY - initY);
                ctx.stroke();
                prevImageData = ctx.getImageData(0, 0, width, height);
            }
            else {
                ctx.fillStyle = colorPicker.value;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.arc(curX, curY, sizePicker.value, degToRad(0), degToRad(360), false);
                ctx.fill();
            }
            console.log("saved");


        }

        requestAnimationFrame(draw);

    };

    draw();


    return (
        <div className="drawContainer" >
            <div className="drawContainer tools">
                <input type="color" defaultValue={defaultColor}></input>
                <input type="range" min="2" max="50" defaultValue="10" id="brushSize"></input>
                <label htmlFor="brushSize">Brush Size</label>
                <button>Clear Canvas</button>
                <button onClick={() => onClickRect()}>[]</button>
            </div>
            <canvas className="drawContainer drawCanvas" id="canvas" ref={canvas} height={height} width={width} />
        </div>

    );
};
DrawContainer.propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
};
export default DrawContainer;