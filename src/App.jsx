import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './styles/theme';
import { ThemeModeProvider, useThemeMode } from './contexts/ThemeModeContext';
import { useThemeSpring } from './hooks/useThemeSpring';
import GlobalStyles from './styles/GlobalStyles';
import Nav from './components/Nav/Nav';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';
import ScrollProgress from './components/ScrollProgress';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import Projects from './components/Projects/Projects';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import BlogIndex from './blog/BlogIndex';
import BlogPost from './blog/BlogPost';

function HomePage() {
  return (
    <>
      <a href="#about" className="sr-only">skip to content</a>
      <ScrollProgress />
      <main>
        <Hero />
        <About />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

function BlogShell({ children }) {
  return (
    <>
      <main>{children}</main>
      <Footer />
    </>
  );
}

function ThemedApp() {
  const { mode } = useThemeMode();
  const theme = mode === 'dark' ? darkTheme : lightTheme;
  useThemeSpring(mode);
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Nav />
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<BlogShell><BlogIndex /></BlogShell>} />
        <Route path="/blog/:slug" element={<BlogShell><BlogPost /></BlogShell>} />
      </Routes>
    </ThemeProvider>
  );
}

function App() {
  return (
    <ThemeModeProvider>
      <ThemedApp />
    </ThemeModeProvider>
  );
}

export default App;
