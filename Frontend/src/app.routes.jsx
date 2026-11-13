import {createBrowserRouter} from "react-router-dom"
import Home from "./pages/Home"
import FacialExpressions from "./pages/FacialExpressions"
export const router= createBrowserRouter([
    {
        path:"/",
        element:<Home />
    },
    {
        path:"/face-expressions",
        element:<FacialExpressions />
    }   
]) 