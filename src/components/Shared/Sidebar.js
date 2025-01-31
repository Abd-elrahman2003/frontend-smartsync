import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCamera, faChartLine, faUser, faDesktop } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom'; 

const Sidebar = ({ isOpen }) => {
  const theme = useTheme();

  const menuItems = [
    { icon: faHome, text: 'dashboard', href: '/' },
    { icon: faCamera, text: 'Cameras', href: '/cameras' },
    { icon: faChartLine, text: 'Statistics', href: '/statistics' },
    { icon: faUser, text: 'Profile', href: '/profile' },
    { icon: faDesktop, text: 'Screen', href: '/Screen' },
  ];

  return (
    <Box
      sx={{
        width: isOpen ? 220 : 60, 
        height: 'calc(110vh - 60px)', 
        backgroundColor: theme.palette.background.paper,
        boxShadow: '2px 0 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: theme.spacing(13),
        position: 'sticky',
        top: '5px',
        left: 0,
        transition: 'width 0.3s', 
        pointerEvents: isOpen ? 'auto' : 'none', 
      }}
    >
      <List>
        {menuItems.map((item, index) => (
          <ListItem
            button
            key={index}
            sx={{
              '&:hover': isOpen
                ? {
                    backgroundColor: theme.palette.primary.main, 
                    color: '#FFFFFF', 
                    borderRadius: theme.shape.borderRadius,
                  }
                : {},
              cursor: isOpen ? 'pointer' : 'default', 
            }}
          >
            <ListItemIcon
              sx={{
                fontSize: isOpen ? '18px' : '21px', 
                marginBottom: isOpen ? '0px' : '20px', 
              }}
            >
              <FontAwesomeIcon icon={item.icon} />
            </ListItemIcon>

            {/* Use Link for internal routing */}
            <Link to={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              {isOpen && <ListItemText primary={item.text} />}
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;