import { createContext } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // ✅ Hardcode dark theme
  const theme = "dark";

  // ✅ Apply dark theme
  if (typeof document !== 'undefined') {
    document.body.classList.add("dark");
    document.body.classList.remove("light");
  }

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};