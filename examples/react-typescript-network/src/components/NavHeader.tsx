import React from 'react';
import { Navbar, NavbarBrand } from 'reactstrap';

export default function NavHeader() {
    return (
        <Navbar color="light" light>
            <NavbarBrand href="/">React + Typescript Examples</NavbarBrand>
        </Navbar>
    );
}
