import AppRouter from './routes/AppRouter';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <ToastProvider>
          <div className="app-container">
            <AppRouter />
          </div>
        </ToastProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
