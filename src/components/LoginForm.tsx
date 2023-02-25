import styled from 'styled-components';
import { useState } from 'react';

import { useUser } from '../composable/user';

const StyledForm = styled(({ className, children, onSubmit }) => (
    <form className={className} onSubmit={onSubmit}>
        {children}
    </form>
))`
    display: grid;
`;
    
const StyledGrid = styled(({ className, children }) => (
    <div className={className}>
        {children}
    </div>
))`
    width: max(20rem, 30%);
    height: 100vh;
    margin-left: auto;
    margin-right: auto;
    padding-top: 3rem;
    padding-left: 1rem;
    padding-right: 1rem;
    grid-template-rows: min-content 1fr;
    grid-template-columns: 1fr;
    
    background: ${props => props.theme.color.cold2};
    
    display: grid;
`;

export default function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    const user = useUser();

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        // const token = await window.api.invoke.login({ username, password });
        const token = { access_token: "helloj", id_token: "hello", refresh_token: "mine" };
        
        console.log(token);

        user.setAccessToken(token.access_token);
        user.setIdToken(token.id_token);
        user.setRefreshToken(token.refresh_token);
    };

    return (
        <StyledGrid>
            <StyledForm onSubmit={onSubmit} >
                <em>
                    You should not enter any passwords into applications that you don't trust. Nevertheless if you wish to use this app the code is available at https://github.com/bris00/AnaBot if you wish to audit it.
                    Some actionable advice:
                </em>
                <br />
                <ul>
                    <li>
                        Make sure your chaster password is different from all your other passwords
                    </li>
                    <li>
                        Use a dummy chaster account for this app.
                    </li>
                </ul>
                <br />
                <label htmlFor="username">Username:</label>
                <input onChange={e => setUsername(e.target.value)} id="username" type="text" />
                {/* <label htmlFor="password">Password:</label> */}
                <input onChange={e => setPassword(e.target.value)} id="password" type="password" />
                <input type="submit" value="Login" />
            </StyledForm>
        </StyledGrid>
    )
}