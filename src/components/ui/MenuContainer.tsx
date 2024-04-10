import React from "react";
import "../../styles/ui/MenuContainer.scss";
import PropTypes from "prop-types";

const MenuContainer = props => (
  <div {...props} className={`menu-container ${props.className ?? ""}`}>
    {props.children}
  </div>
);

MenuContainer.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default MenuContainer;