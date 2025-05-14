import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import GroupsPage from "./pages/GroupsPage";
import RegisterPage from "./pages/RegisterPage";
import NavBar from "./components/NavBar";
import { useEffect } from "react";
import UserProfilePage from "./pages/UserProfilePage";
import CreateGroupPage from "./pages/CreateGroupPage";
import GroupDetailPage from "./pages/GroupDetailPage";

function App() {
  const { user, loading } = useAuthStore();

  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <Router>
      <NavBar />
      {loading ? (
        <div className='h-screen flex items-center justify-center'>
          Loading…
        </div>
      ) : (
        <Routes>
          {/* Public route */}
          <Route
            path='/login'
            element={!user ? <LoginPage /> : <Navigate to='/' replace />}
          />
          <Route
            path='/register'
            element={!user ? <RegisterPage /> : <Navigate to='/' replace />}
          />

          {/* All routes inside here require auth */}
          <Route element={<ProtectedRoute />}>
            <Route path='/' element={<DashboardPage />} />
            <Route path='/groups' element={<GroupsPage />} />
            <Route path='/groups/create' element={<CreateGroupPage />} />
            <Route path='/groups/:groupId' element={<GroupDetailPage />} />
            <Route path='/profile' element={<UserProfilePage />} />
            {/* add more protected routes here */}
          </Route>
        </Routes>
      )}
    </Router>
  );
}

export default App;
