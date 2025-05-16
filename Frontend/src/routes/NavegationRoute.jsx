import { BrowserRouter, Routes, Route } from "react-router-dom"

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
                <Route path="/" element={<Dashboard />} />
               
                
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