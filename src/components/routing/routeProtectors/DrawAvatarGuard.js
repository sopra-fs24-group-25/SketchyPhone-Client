import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import User from "models/User";

/**
 *
 * Another way to export directly your functional component is to write 'export const' 
 * instead of 'export default' at the end of the file.
 */
export const DrawAvatarGuard = () => {
    const user = new User(JSON.parse(sessionStorage.getItem("user")));
    if (user?.persistent) {

        return <Outlet />;
    }

    return <Navigate to="/GameRoom" replace />;
};
