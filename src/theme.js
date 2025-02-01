import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#EB5800' }, // Orange
    secondary: { main: '#59c6c' }, // Baby Blue
    error: { main: '#D91656' }, // Simone
    background: {
      default: '#FFFFFF', // Page Background
      paper: '#FFF6E9', // Header, Sidebar Background
    },
    text: {
      primary: '#2A3335', // General Text
      secondary: '#640D5F', // Sidebar and Footer Text
    },
  },
  typography: {
    fontFamily: ['Lato', 'Open Sans'].join(','),
  },
  shape: {
    borderRadius: 10, // Default Border Radius
  },
  spacing: 5, // Default Spacing
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            cursor: 'pointer', // Add cursor pointer on hover
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.3s ease',
          '&:hover': {
            cursor: 'pointer', // Add cursor pointer on hover
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'color 0.3s ease',
          '&:hover': {
            cursor: 'pointer', // Add cursor pointer on hover
          },
        },
      },
    },
  },
});

export default theme;
