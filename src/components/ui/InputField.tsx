import React from 'react';
import PropTypes from "prop-types";

export const TextInput  = props => (
    <input 
    {...props}
    style={{width: props.width, ...props.style}}
    maxLength = {props.maxLength}
    className={`input-field ${props.className}`}
    onChange = {handleChange}>
    {props.children}
    </input>
);

const handleChange = (e) => {
    if (e.target.value.length === e.target.maxLength){
        window.alert("Maximum characters reached!");
    }
}

TextInput.propTypes = {
    width: PropTypes.number,
    maxLength: PropTypes.number,
    style: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.node,
  };

  export default TextInput