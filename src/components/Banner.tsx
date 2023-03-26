import styled from 'styled-components';
import { Link } from 'react-router-dom';

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";

import { useUser } from '@/composable/user';

export default function Banner() {
    const user = useUser();

    const logout = () => {
      user.setAccessToken(null);
      user.setIdToken(null);
      user.setRefreshToken(null);
    };

    return (
      <Navbar collapseOnSelect expand={false} bg="dark" variant='dark'>
        <Container>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Brand href="#">
            AnaBot
          </Navbar.Brand>
          {user.id ? <Navbar.Text>{user.id.preferred_username}</Navbar.Text> : <Navbar.Text><Link to="/login">Login</Link></Navbar.Text>} 
        </Container>
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="#/automation/share-link">Automation - Share Link</Nav.Link>
          </Nav>
          <Nav className="mr-auto">
            <Nav.Link href="#/keyholding">Keyholding</Nav.Link>
          </Nav>
          <Nav className="mr-auto">
            <Nav.Link href="#/vizl">Vizualize Locks</Nav.Link>
          </Nav>
          <Nav className="mr-auto">
            <Nav.Link onClick={logout}>Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
}