import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 *
 * Another way to export directly your functional component is to write 'export const' 
 * instead of 'export default' at the end of the file.
 */
export const StartGuard = () => {
    if (!sessionStorage.getItem("user")) {

        return <Outlet />;
    }

    return <Navigate to="/GameRoom" replace />;
};
