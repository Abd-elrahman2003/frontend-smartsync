import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCamera, faChartLine, faUser } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@mui/material/styles';

const Sidebar = ({ isOpen }) => {
  const theme = useTheme();

  const menuItems = [
    { icon: faHome, text: 'Home' },
    { icon: faCamera, text: 'Cameras' },
    { icon: faChartLine, text: 'Statistics' },
    { icon: faUser, text: 'Profile' },
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
            {isOpen && <ListItemText primary={item.text} />}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
