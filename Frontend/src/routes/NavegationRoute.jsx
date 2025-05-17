import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import { NotFound } from "../View/NotFound"
import { Dashboard } from "../View/Dashboard"
import { HistorialDashboard } from "../View/HistorialDashboard"
import { HomeDashboard } from "../View/HomeDashboard"
import { ThemeProvider } from "../context/ThemeProvider"


export const NavegationRoute = () =>{

    return(
        <BrowserRouter>
            <ThemeProvider>
                 <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
               
                
                <Route path="/dashboard" element={<Dashboard />}>
                    <Route index element={<HomeDashboard />} />
                    <Route path="historial" element={<HistorialDashboard/>} />
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes> 
            </ThemeProvider>
              
        </BrowserRouter>
        
    )
}