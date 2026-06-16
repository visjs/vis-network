import React from 'react';
import { Nav, Navbar, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';

export default function NavMenu() {
    return (
        <Navbar light expand="md">
            <Nav vertical navbar >
                <NavItem>
                    <NavLink tag={Link} className="text-dark" to="/">Basic</NavLink>
                </NavItem>
            </Nav>
        </Navbar>
    );
}
