import React from 'react';
import { AppBar, Toolbar, IconButton, InputBase, Box, Badge, InputAdornment, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBell, faEnvelope, faMagnifyingGlass, faUser } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@mui/material/styles';

const Header = ({ toggleSidebar }) => {
  const theme = useTheme();

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: theme.zIndex.drawer + 1,
        height: '60px',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={toggleSidebar} sx={{ marginRight: theme.spacing(1) }}>
            <FontAwesomeIcon icon={faBars} />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <img
              src="/logo.png" 
              alt="Logo"
              style={{
                height: '30px', 
                objectFit: 'contain',
                marginLeft: theme.spacing(1),
              }}
            />
            <Typography
              variant="h6"
              sx={{
                position: 'absolute',
                left: '42px', 
                fontWeight: 'bold',
                color: theme.palette.text.primary,
                fontSize: '19px',
                zIndex: -1, 
                whiteSpace: 'nowrap', 
              }}
            >
              SMART SYNC
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <InputBase
            placeholder="Search…"
            startAdornment={
              <InputAdornment position="start">
                <FontAwesomeIcon icon={faMagnifyingGlass} style={{ color: theme.palette.text.primary }} />
              </InputAdornment>
            }
            sx={{
              width: '30%',
              backgroundColor: '#FFFFFF',
              padding: theme.spacing(1),
              borderRadius: theme.shape.borderRadius,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
              transition: 'box-shadow 0.3s ease',
              '&:hover': {
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
              },
              paddingLeft: '10px', 
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton>
            <Badge badgeContent={4} color="error">
              <FontAwesomeIcon icon={faEnvelope} />
            </Badge>
          </IconButton>
          <IconButton>
            <Badge badgeContent={10} color="error">
              <FontAwesomeIcon icon={faBell} />
            </Badge>
          </IconButton>

          <IconButton>
            <FontAwesomeIcon icon={faUser} style={{ color: theme.palette.text.primary }} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
