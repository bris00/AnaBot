import styled from 'styled-components';
import { useState, useEffect } from 'react';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import prettyMs from 'pretty-ms';

import { useUser } from '@/composable/user';

import { Null } from "@/composable/user";

const StyledController = styled(({ className, children }) => (
    <div className={className}>
        {children}
    </div>
))`
    padding-bottom: 1rem;
`;
    
const StyledGrid = styled(({ className, children }) => (
    <div className={className}>
        {children}
    </div>
))`
    width: 100%;
    height: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-top: 3rem;
    padding-left: 1rem;
    padding-right: 1rem;
    grid-template-rows: 1fr min-content ;
    grid-template-columns: 1fr;
    
    // background: ${props => props.theme.color.cold2};
    
    display: grid;
`;

function Stat({title, heading, sub}: { title: string, heading: string, sub: string}) {
    return (
        <Card>
            <Card.Body>
                <Card.Title className="text-uppercase text-muted mb-0">{title}</Card.Title>
                <Card.Text>{heading}</Card.Text>
                <Card.Text>{sub}</Card.Text>
            </Card.Body>
        </Card>
    );
}

function secondsToString(seconds: number) {
    return prettyMs(seconds * 1000, { compact: true });
}

export default function () {
    const user = useUser();

    const [text, setText] = useState(localStorage.getItem('text') || "");
    const [skipped, setSkipped] = useState([] as string[]);
    const [timeAdded, setTimeAdded] = useState(0);
    const [mostTimeAdded, setMostTimeAdded] = useState(0);
    
    const [totalTimeAdded, setTotalTimeAdded] = useState<number>(Null.map(localStorage.getItem('totalTimeAdded'), JSON.parse) || 0);
    const [totalMostTimeAdded, setTotalMostTimeAdded] = useState<number>(Null.map(localStorage.getItem('totalMostTimeAdded'), JSON.parse) || 0);

    useEffect(() => {
        localStorage.setItem('text', text);
    }, [text]);

    useEffect(() => {
        localStorage.setItem('totalTimeAdded', JSON.stringify(totalTimeAdded));
    }, [totalTimeAdded]);

    useEffect(() => {
        localStorage.setItem('totalMostTimeAdded', JSON.stringify(totalMostTimeAdded));
    }, [totalMostTimeAdded]);
    
    const onClick = async () => {
        setSkipped([]);

        await Promise.allSettled([...text.matchAll(/https:\/\/chaster\.app\/sessions\/([a-zA-Z0-9]+)( - (.+)$)?/gm)].map(async match => {
            const linkId = match[1];

            const lock = await (await fetch("https://api.chaster.app/shared-links/" + linkId, {
                headers: {
                    authorization: "Bearer " + user.accessToken,
                }
            })).json();
            
            if (!lock.canVote) {
                setSkipped(l => [...l, match[0]]);
                return;
            }
            
            const actionReq = await fetch(`https://api.chaster.app/locks/${lock.lockId}/extensions/${lock.extensionId}/action`, {
                method: "POST",
                headers: {
                    authorization: "Bearer " + user.accessToken,
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    action: "vote",
                    payload: {
                        action: "add",
                        sessionId: linkId,
                    }
                })
            });
            
            if (!actionReq.ok) {
                setSkipped(l => [...l, match[0]]);
                console.warn(await actionReq.json());
                return;
            }
            
            const action = await actionReq.json();
            
            setTimeAdded(time => time + action.duration);
            setMostTimeAdded(time => Math.max(time, action.duration));
            setTotalTimeAdded(time => time + action.duration);
            setTotalMostTimeAdded(time => Math.max(time, action.duration));
        }));
    };

    return (
        <StyledGrid>
            <StyledController>
                <Tabs
                    defaultActiveKey="results"
                    id="uncontrolled-tab-example"
                    className="mb-3"
                >
                    <Tab eventKey="results" title="Results">
                        <Container>
                            <Row md={2}>
                                <Col>
                                    <Stat title="Time added" heading={secondsToString(totalTimeAdded)} sub={`${secondsToString(timeAdded)} in session`} />
                                </Col>
                                <Col>
                                    <Stat title="Largest individual add" heading={secondsToString(totalMostTimeAdded)} sub={`${secondsToString(mostTimeAdded)} in session`} />
                                </Col>
                            </Row>
                            <Row md={2}>
                                <Col>
                                    <Stat title="Skipped" heading={`${skipped.length} links`} sub="" />
                                </Col>
                                <Col>
                                    <Stat title="Something" heading="lorem ipsum" sub="" />
                                </Col>
                            </Row>
                        </Container>
                    </Tab>
                    <Tab eventKey="skipped" title="Skipped">
                        { skipped.map(link => <span style={{whiteSpace: 'pre'}} key={link}>{link + '\n'}</span> ) }
                    </Tab>
                    <Tab eventKey="settings" title="Settings">
                    </Tab>
                </Tabs>
            </StyledController>
            <textarea value={text} style={{height: '30rem'}} onChange={ e => setText(e.target.value) }></textarea>
            <Button onClick={onClick} disabled={!user.accessToken}>RUN</Button>
        </StyledGrid>
    )
}