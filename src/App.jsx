import { Routes, Route } from "react-router-dom";
import MainPage from "./MainPage";
import Admin from "./Admin";
import History from "./History";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/history" element={<History />} />
    </Routes>
  );
}
