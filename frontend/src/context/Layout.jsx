import { Box, Flex } from "@chakra-ui/react";
import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Layout() {
  return (
    <Flex direction="column" minH="100vh">
      <Navbar />
      <Box as="main" flex="1" p={4}>
        <Outlet />
      </Box>
      <Footer />
    </Flex>
  );
}
