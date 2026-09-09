import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { applyTheme, loadTheme } from './lib/storage.js';
import './styles.css';

applyTheme(loadTheme());

createRoot(document.getElementById('root')).render(<App />);

createRoot(document.getElementById('root')).render(<App />);
