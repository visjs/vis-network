import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import NavMenu from './NavMenu';
import NavHeader from './NavHeader';

export default function Layout(props: React.PropsWithChildren<any>) {
    return (
        <div>
            <NavHeader />
            <Container fluid>
                <Row>
                    <Col xs="2" >
                        <NavMenu />
                    </Col>
                    <Col>
                        {props.children}
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
