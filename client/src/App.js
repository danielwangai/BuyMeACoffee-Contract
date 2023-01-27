import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import CreatorDetail from "./components/CreatorDetail";

function App() {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/creator/:id" element={<CreatorDetail />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
