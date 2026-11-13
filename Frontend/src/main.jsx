import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './app.routes.jsx'
ReactDOM.createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />
)
