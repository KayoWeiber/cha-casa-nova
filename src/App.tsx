import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import ListaPresentes from './pages/ListaPresentes';
import ConfirmePresenca from './pages/ConfirmePresenca';
import Login from './pages/Login';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lista-presentes" element={<ListaPresentes />} />
        <Route path="/confirmar-presenca" element={<ConfirmePresenca />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} /> 
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
