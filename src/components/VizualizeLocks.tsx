import styled from 'styled-components';
import { useState, useCallback, useMemo } from 'react';

import { useUser } from '@/composable/user';
import { parseHistory } from '@/extract-events';
import Toast from 'react-bootstrap/esm/Toast';
import Table from 'react-bootstrap/esm/Table';
import Button from 'react-bootstrap/esm/Button';

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

export default function () {
    const user = useUser();

    const [locks, setLocks] = useState([] as unknown[]);
    const [showCopyToast, setShowCopyToast] = useState(false);

    const loadLocks = useCallback(async () => {
        setLocks(
            await (await fetch("https://api.chaster.app/locks?status=all", {
                headers: {
                    authorization: "Bearer " + user.accessToken,
                }
            })).json()
        )
    }, []);

    useMemo(() => loadLocks(), []);

    const onClick = async (id: string) => {
        const lock = await (await fetch("https://api.chaster.app/locks/" + id, {
            headers: {
                authorization: "Bearer " + user.accessToken,
            }
        })).json();

        let history = await (await fetch("https://api.chaster.app/locks/" + id + "/history", {
            method: "POST",
            headers: {
                authorization: "Bearer " + user.accessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                limit: 100,
            }),
        })).json();
        
        while (history.hasMore) {
            const { hasMore, results } = await (await fetch("https://api.chaster.app/locks/" + id + "/history", {
                method: "POST",
                headers: {
                    authorization: "Bearer " + user.accessToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    limit: 100,
                    lastId: history.results[history.results.length - 1]._id,
                }),
            })).json();
            
            history.results = [...history.results, ...results];
            history.hasMore = hasMore;
        }
        
        const events = parseHistory(history.results, lock);
        
        const code = btoa(JSON.stringify(events));
        
        navigator.clipboard.writeText("https://bris00.github.io/vizl/#/" + code).then(() => setShowCopyToast(true));
    };

    return (
        <StyledGrid>
            <StyledController>
                <Table striped>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Keyholder</th>
                            <th>Lock Title</th>
                            <th>Status</th>
                            <th>Visualise</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* {locks.map(l => <div key={l._id} onClick={e => onClick(l._id)}>{`${l.user.username} - ${l.title} [${l.status}]`}</div>)} */}
                        {locks.map((l, i) => (
                            <tr key={l._id}>
                                <td>{i}</td>
                                <td>{l.keyholder.username}</td>
                                <td>{l.title}</td>
                                <td>{l.status}</td>
                                <td><Button onClick={e => onClick(l._id)} variant='info'>Visualise</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </StyledController>
            <Toast onClose={() => setShowCopyToast(false)} show={showCopyToast} delay={3000} autohide>
                <Toast.Header>
                    <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
                    <strong className="me-auto">Copied!</strong>
                </Toast.Header>
                <Toast.Body>Visualisation URL copied to clipboard</Toast.Body>
            </Toast>
        </StyledGrid>
    )
}