import React, { useState } from "react";
import Header from "../Shared/Header"; 
import Sidebar from "../Shared/Sidebar"; 
import Footer from "../Shared/Footer";
import { Box, Container } from "@mui/material";
import Table from "../Shared/Tables"; 

const Home = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen((prevState) => !prevState); 
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header */}
      <Header toggleSidebar={toggleSidebar} />

      <Box sx={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} />

        {/* Main Content */}
        <Container
          sx={{
            flex: 1,
            paddingTop: 13,
            paddingLeft: isSidebarOpen ? 2 : 3, 
            paddingRight: 2,
            transition: "padding-left 0.3s", 
          }}
        >
       
          {/* Add the Table component here */}
          <Table />

        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default Home;
