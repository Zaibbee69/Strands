import { Button, Flex, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // 1. Perform mock authentication login action
    localStorage.setItem("user_token", "secure_session_key");

    // 2. Redirect securely to the protected feed
    navigate("/", { replace: true });
  };

  return (
    <Flex
      height="100vh"
      align="center"
      justify="center"
      direction="column"
      gap={4}
    >
      <Heading>Welcome Back</Heading>
      <Button colorScheme="blue" onClick={handleLogin}>
        Log In to Social Feed
      </Button>
    </Flex>
  );
}
