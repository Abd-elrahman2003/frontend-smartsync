import React from "react";
import { Box, Container, Grid, Typography, IconButton, Link, useTheme, useMediaQuery } from "@mui/material";
import { styled } from "@mui/system";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const StyledFooter = styled(Box)(({ theme }) => ({
  backgroundColor: "#172B4D",
  color: "#fff",
  padding: "48px 0 24px 0",
  position: "relative",
  boxShadow: "0 -5px 15px rgba(0,0,0,0.1)",
  borderTopLeftRadius: "16px",
  borderTopRightRadius: "16px",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: "16px",
    borderTopRightRadius: "16px",
    zIndex: 0
  }
}));

const ContentBox = styled(Box)({
  position: "relative",
  zIndex: 1
});

const SocialButton = styled(IconButton)({
  color: "#fff",
  margin: "0 8px",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.1)",
    color: "#f0f0f0"
  }
});

const FooterLink = styled(Link)({
  color: "#fff",
  textDecoration: "none",
  transition: "color 0.3s ease",
  "&:hover": {
    color: "#f0f0f0"
  }
});

const Footer = () => {
  const theme = useTheme();
  // eslint-disable-next-line no-unused-vars
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const contactInfo = [
    { icon: <FaPhone />, text: "+1 (555) 123-4567" },
    { icon: <FaEnvelope />, text: "contact@example.com" },
    { icon: <FaMapMarkerAlt />, text: "123 Business Street, Suite 100, City, ST 12345" }
  ];

  const quickLinks = [
    "About Us",
    "Services",
    "Products",
    "Contact Us",
    "Careers",
    "Privacy Policy"
  ];

  return (
    <StyledFooter component="footer" role="contentinfo" aria-label="Site footer">
      <Container maxWidth="lg">
        <ContentBox>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>About Us</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                We are dedicated to providing exceptional services and solutions to our valued customers. Our commitment to excellence drives everything we do.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <SocialButton aria-label="Facebook" component="a" href="#" target="_blank">
                  <FaFacebook />
                </SocialButton>
                <SocialButton aria-label="Twitter" component="a" href="#" target="_blank">
                  <FaTwitter />
                </SocialButton>
                <SocialButton aria-label="Instagram" component="a" href="#" target="_blank">
                  <FaInstagram />
                </SocialButton>
                <SocialButton aria-label="LinkedIn" component="a" href="#" target="_blank">
                  <FaLinkedin />
                </SocialButton>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Quick Links</Typography>
              <Grid container spacing={1}>
                {quickLinks.map((link, index) => (
                  <Grid item xs={6} key={index}>
                    <FooterLink href="#" variant="body2">
                      {link}
                    </FooterLink>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Contact Us</Typography>
              {contactInfo.map((info, index) => (
                <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box sx={{ mr: 1 }}>{info.icon}</Box>
                  <Typography variant="body2">{info.text}</Typography>
                </Box>
              ))}
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, pt: 2, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <Typography variant="body2" align="center">
              © {new Date().getFullYear()} Your Company Name. All rights reserved.
            </Typography>
          </Box>
        </ContentBox>
      </Container>
    </StyledFooter>
  );
};

export default Footer;