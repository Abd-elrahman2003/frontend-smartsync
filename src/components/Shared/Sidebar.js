/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faUserGroup,
  faCircle,
  faGear,
  faWarehouse,
  faFileAlt,
  faChevronDown,
  faClipboardList,
  faUserShield,
  faUserCircle,
  faChartLine,
  faUserTie,
  faBox,
  faMapMarkerAlt,
  faUsers,
  faTv,
  faThLarge,
  faCubes,
  faStore,
  faShoppingCart,
  faExchangeAlt,
  faHandshake,
  faShare,
  faTags
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { icon } from '@fortawesome/fontawesome-svg-core';

const Sidebar = ({ isOpen }) => {
  const theme = useTheme();

  const [userManagementOpen, setUserManagementOpen] = useState("none");
  const [prev, setPrev] = useState("none");
  
  const toggleUserManagement = (current) => {
    console.log("Previous:", prev);
    console.log("Current:", current);
  
    if (prev === current) {
      setUserManagementOpen("none");
      setPrev("none"); // Reset prev to "none"
    } else {
      setUserManagementOpen(current);
      setPrev(current);
    }
  };
  
  
  const menuItems = [
    { icon: faHome, text: 'Dashboard', href: '/' },
    {
      icon: faUserGroup,
      text: 'User Management',
      href: '/user-management',
      children: [
        { icon: faUsers, text: 'Users', href: '/users' },
        { icon: faUserShield, text: 'Roles', href: '/roles' },
        { icon: faFileAlt, text: 'System Logs', href: '/system-logs' },
      ],
    },
    { icon: faGear, text: 'Settings', href: '/settings' },
    { icon: faWarehouse, text: 'Warehouse', href: '/warehouse', 
      children: [
        { icon: faCubes, text: 'Items', href: '/users' },
        { icon: faMapMarkerAlt, text: 'Locations', href: '/locations' },
      ],
     },
    { icon: faChartLine, text: 'Reports', href: '/reports' },
    { icon: faUserCircle, text: 'General accounts', href: '/general-accounts',
      children: [
        {icon: faTags, text: 'Selling', href: '/selling'},
      ],
     },
    { icon: faBox, text: 'Products', href: '/products' },
    { icon: faTv, text: 'Screens', href: '/Screen' },
    { icon: faThLarge, text: 'Categories', href: '/category' },
    { icon: faStore, text: 'Store', href: '/store' },
    { icon: faShoppingCart, text: 'Purchase', href: '/purchase' },
    { icon: faShare, text: 'Purchase Return', href: '/return-purchase' },
    { icon: faShare, text: 'selling Return', href: '/return-selling' },
    { icon: faExchangeAlt, text: 'Transfer', href: '/transfers' },
    { icon: faHandshake, text: 'Suppliers', href: '/supplier' },
  ];
  return (
    <Box
      sx={{
        width: isOpen ? 250 : 60,
        height: '130vh',
        backgroundColor: theme.palette.background.paper,
        boxShadow: '2px 0 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: theme.spacing(13),
        position: 'sticky',
        top: '0',
        left: 0,
        transition: 'width 0.3s',
        overflow: 'hidden',
      }}
    >
      <List>
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            {item.children ? (
              <>
                <ListItem
                  button
                  onClick={() => toggleUserManagement(item.text)}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main,
                      color: '#FFFFFF',
                    },
                    color: theme.palette.text.primary,
                    cursor: isOpen ? 'pointer' : 'default',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      fontSize: isOpen ? '18px' : '21px',
                      padding: isOpen ? '0' : '10px 0',
                      color: theme.palette.text.primary,
                      '&:hover': {
                        color: '#FFFFFF',
                      },
                    }}
                  >
                    <FontAwesomeIcon icon={item.icon} />
                  </ListItemIcon>
                  {isOpen && (
                    <ListItemText
                      primary={item.text}
                      sx={{
                        color: theme.palette.text.primary,
                        '&:hover': {
                          color: '#FFFFFF',
                        },
                      }}
                    />
                  )}
                  {isOpen && (
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      style={{
                        color: theme.palette.text.primary,
                        transform: userManagementOpen == item.text ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.3s',
                      }}
                    />
                  )}
                </ListItem>
                <Collapse in={userManagementOpen == item.text && isOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((childItem, childIndex) => (
                      <ListItem
                        button
                        key={childIndex}
                        component={Link}
                        to={childItem.href}
                        sx={{
                          display: isOpen ? 'flex' : 'none', 
                          pl: 4,
                          '&:hover': {
                            backgroundColor: theme.palette.primary.main,
                            color: '#FFFFFF',
                          },
                          color: theme.palette.text.primary,
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            fontSize: '10px',
                            color: theme.palette.text.primary,
                            '&:hover': {
                              color: '#FFFFFF',
                            },
                          }}
                        >
                          <FontAwesomeIcon icon={childItem.icon} />
                        </ListItemIcon>
                        <ListItemText
                          primary={childItem.text}
                          sx={{
                            color: theme.palette.text.primary,
                            '&:hover': {
                              color: '#FFFFFF',
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <ListItem
                button
                key={index}
                component={Link}
                to={item.href}
                sx={{
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                    color: '#FFFFFF',
                  },
                  color: theme.palette.text.primary,
                }}
              >
                <ListItemIcon
                  sx={{
                    fontSize: isOpen ? '18px' : '21px',
                    color: theme.palette.text.primary,
                    '&:hover': {
                      color: '#FFFFFF',
                    },
                  }}
                >
                  <FontAwesomeIcon icon={item.icon} />
                </ListItemIcon>
                {isOpen && (
                  <ListItemText
                    primary={item.text}
                    sx={{
                      color: theme.palette.text.primary,
                      '&:hover': {
                        color: '#FFFFFF',
                      },
                    }}
                  />
                )}
              </ListItem>
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
