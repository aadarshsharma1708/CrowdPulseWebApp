import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Home from "./Pages/Home/Home";
import "./App.css";
import Create_poll from "./Pages/create_poll/Create_poll";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import LivePoll from "./Pages/LivePoll/LivePoll";
import PollView from "./Pages/PollView/PollView";
import Results from "./Pages/Result/Results";
import { AuthProvider } from "./context/AuthContext";

function AppContent() {
  const location = useLocation();
  
  // Logic to hide Navbar/Footer for the specialized PollView page
  const hideLayout = location.pathname.startsWith("/poll/");

  return (
    <div className="app dark">
      {!hideLayout && <Navbar />}
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/createPoll" element={<Create_poll />} />
          <Route path="/LivePoll" element={<LivePoll />} />
          <Route path="/LivePoll/:id" element={<LivePoll />} />
          <Route path="/poll/:id" element={<PollView />} />
          <Route path="/Results" element={<Results />} />
          {/* Optional: Catch-all route to redirect 404s inside the app */}
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
      {!hideLayout && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;