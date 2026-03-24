import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Tontines from "./pages/Tontines";
import Create from "./pages/Create";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tontines" element={<Tontines />} />
      <Route path="/create" element={<Create />} />
      <Route path="/dashboard/:id" element={<Dashboard />} />
    </Routes>
  );
}

export default App;