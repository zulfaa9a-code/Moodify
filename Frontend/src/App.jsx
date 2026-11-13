import {RouterProvider} from "react-router"
import {router} from "./app.routes"
import "./App.scss"
function App() {
  return (
    <div>
      <RouterProvider router ={router}/>
    </div>
  );
}
export default App
