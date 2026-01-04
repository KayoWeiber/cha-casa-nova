import { BrowserRouter, Routes, Route,} from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import ListaPresentes from './pages/ListaPresentes';
import ConfirmePresenca from './pages/ConfirmePresenca';

function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lista-presentes" element={<ListaPresentes />} />
        <Route path="/confirme-presenca" element={<ConfirmePresenca />} />
        <Route path="*" element={<NotFound />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
