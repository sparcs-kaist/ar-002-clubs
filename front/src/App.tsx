import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";
import MainApp from "./MainApp";
import "App.css";
import { ExecutiveStatusProvider } from "contexts/ExecutiveStatusContext";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ExecutiveStatusProvider>
          <MainApp />
        </ExecutiveStatusProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
