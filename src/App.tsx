import { Suspense, lazy, createContext } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { Routes, Route } from "react-router-dom";

import Banner from './components/Banner';
import WelcomeMissAna from './components/WelcomeMissAna';
import { createUser, UserContext } from './composable/user';

const theme = {
  color: {
    accent1: "#721817",
    accent2: "#0B6E4F",
    warm: "#FA9F42",
    cold1: "#2B4162",
    cold2: "#E0E0E2"
  },
  font: "Roboto, sans-serif",
};

const GlobalStyle = styled.div`
  > * {
    font-family: ${props => props.theme.font};
  }
`;

const LoginForm = lazy(() => import('./components/LoginForm'));
const ShareLink = lazy(() => import('./components/automation/ShareLink'));
const VizualizeLocks = lazy(() => import('./components/VizualizeLocks'));
const Keyholder = lazy(() => import('./components/Keyholder'));

function App() {
  // TODO: NoMatch, Random welcome message
  // {/* <Route path="*" element={<NoMatch />} /> */}

  const user = createUser();

  return (
    <ThemeProvider theme={theme}>
      <UserContext.Provider value={user}>
        <GlobalStyle>
          <Banner />
          <Routes>
            <Route path="/">
              <Route index element={<WelcomeMissAna />} />
              <Route path="login" element={
                <Suspense fallback={<>...</>}>
                  <LoginForm />
                </Suspense>
              } />
            </Route>
            <Route path="/automation">
              <Route path="share-link" element={
                <Suspense fallback={<>...</>}>
                  <ShareLink />
                </Suspense>
              } />
            </Route>
            <Route path="/vizl" element={
              <Suspense fallback={<>...</>}>
                <VizualizeLocks />
              </Suspense>
            } />
            <Route path="/keyholding" element={
              <Suspense fallback={<>...</>}>
                <Keyholder />
              </Suspense>
            } />
          </Routes> 
        </GlobalStyle>
      </UserContext.Provider>
    </ThemeProvider>
  )
}

export default App
