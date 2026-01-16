import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import ListaPresentes from './pages/ListaPresentes';
import ConfirmePresenca from './pages/ConfirmePresenca';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import AdminGifts from './pages/AdminGifts';
import AdminReservas from './pages/AdminReservas';
import AdminConfirmacoes from './pages/AdminConfirmacoes';
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
          
          {/* Admin routes with shared layout */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminGifts />} />
            <Route path="reservas" element={<AdminReservas />} />
            <Route path="confirmacoes" element={<AdminConfirmacoes />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
