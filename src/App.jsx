import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';


function App() {
  return (
    <BrowserRouter>  {/* ✅ Sirf ek baar BrowserRouter */}
      <AppRoutes />      
    </BrowserRouter>
  );
}

export default App;