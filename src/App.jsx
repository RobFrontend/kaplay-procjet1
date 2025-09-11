import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import Game from "./components/Game";
import { useState } from "react";

const queryClient = new QueryClient();

function App() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <QueryClientProvider client={queryClient}>
      <div className="game-box">
        <Game isOpen={isOpen} />
        {isOpen && (
          <div className="abs-box">
            <p>Controls:</p>
            <ul>
              <li>{"<-"} to go Left</li>
              <li>{"->"} to go Right</li>
              <li>Space to Jump</li>
            </ul>
            <button onClick={() => setIsOpen(false)}>OK, Let's Go!</button>
          </div>
        )}
      </div>
    </QueryClientProvider>
  );
}

export default App;
