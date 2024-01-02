import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";
import MainApp from "./MainApp";
import "App.css";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
