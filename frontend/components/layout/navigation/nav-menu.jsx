import Link from 'next/link';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { useAuth } from '../../../auth/hooks/use-auth';
import navigation from './navigation';
import PersonIcon from '@mui/icons-material/Person';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import Logo from '../../ui/logo';
const NavMenu = () => {
  const auth = useAuth();
  const navItems = navigation();
  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand href="#home">
          <Logo src="/images/logo.png" width={40} height={40} />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-lg-auto">
            <Link href="/" passHref legacyBehavior>
              <Nav.Link as="a" className="fw-bold">
                Dashboard
              </Nav.Link>
            </Link>
            {navItems.map((item, index) => {
              if (item.children) {
                return (
                  <NavDropdown title={item.label} key={index}>
                    {item.children.map((child, index) => (
                      <Link
                        href={child.path}
                        passHref
                        key={index}
                        legacyBehavior
                      >
                        <NavDropdown.Item as="a">
                          {child.label}
                        </NavDropdown.Item>
                      </Link>
                    ))}
                  </NavDropdown>
                );
              } else {
                return (
                  <Link href={item.path} passHref key={index} legacyBehavior>
                    <Nav.Link as="a">{item.label}</Nav.Link>
                  </Link>
                );
              }
            })}
          </Nav>
          <Nav className="">
            <Nav.Link
              as="span"
              className=" py-0 d-flex align-items-center text-dark"
              disabled
            >
              <PersonIcon className="me-1" />
              {auth.user.username}
            </Nav.Link>
            <Nav.Link as="button" className="btn" onClick={auth.signOut}>
              <PowerSettingsNewIcon className="text-danger" />
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavMenu;
