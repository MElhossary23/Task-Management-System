import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4f46e5",
    },
    secondary: {
      main: "#14b8a6",
    },
    background: {
      default: "#f3f4f6",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "Inter, Arial, sans-serif",
    h4: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default theme;
