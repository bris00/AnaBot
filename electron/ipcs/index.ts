import { createInterprocess } from 'interprocess';

import crypto from 'node:crypto';

import { RequestInfo, RequestInit } from 'node-fetch';

const fetch = (url: RequestInfo, init?: RequestInit) =>
  import('node-fetch').then(({ default: fetch }) => fetch(url, init));
  
function parseCookies(response) {
  const raw = response.headers.raw()['set-cookie'];
  return raw.map((entry) => {
    const parts = entry.split(';');
    const cookiePart = parts[0];
    return cookiePart;
  }).join(';');
}

type Token = {
  "access_token": string,
  "expires_in": number,
  "refresh_expires_in": number,
  "refresh_token": string,
  "token_type": string,
  "id_token": string,
  "not-before-policy": number,
  "session_state": string,
  "scope": string
};

export const { ipcMain, ipcRenderer, exposeApiToGlobalWindow } =
  createInterprocess({
    main: {
        async login(_, { username, password }: { username: string, password: string }): Promise<Token> {
          const clientId = "web";
          const userAgent = { 'user-agent': "AnaBot/0.1.0" };

          const state = crypto.randomUUID();
          const nonce = crypto.randomUUID();
          
          const authn = await fetch("https://sso.chaster.app/auth/realms/app/protocol/openid-connect/auth?" + new URLSearchParams({
            client_id: clientId,
            redirect_uri: "https://chaster.app/",
            state,
            response_mode: "fragment",
            response_type: "code",
            scope: "openid",
            nonce,
          }), {
            headers: userAgent,
          });

          const cookie = parseCookies(authn);
          
          const html = await authn.text();
          
          const sessionCode = html.match(/session_code=([^(&|")]+)(&|")/)?.[1];
          const execution = html.match(/execution=([^(&|")]+)(&|")/)?.[1];
          const tabId = html.match(/tab_id=([^(&|")]+)(&|")/)?.[1];

          if (!sessionCode || !execution || !tabId) { throw html; }

          const login = await fetch("https://sso.chaster.app/auth/realms/app/login-actions/authenticate?" + new URLSearchParams({
            session_code: sessionCode,
            execution,
            client_id: clientId,
            tab_id: tabId,
          }), {
            method: "POST",
            redirect: "manual",
            headers: {
              ...userAgent,
              cookie,
            },
            body: new URLSearchParams({
              username,
              password,
              rememberMe: "on",
              credentialId: "",
            }),
          });
          
          if (login.status != 302) { 
            const loginResponse = await login.text();
            
            const error = loginResponse.match(/id="input-error"[^>]*>([^<]*)</)?.[1].trim();

            throw error;
          }
          
          const code = login.headers.get('location')?.match(/code=(.[^&]+)/)?.[1];
          
          if (!code) { throw code; }

          const token = await fetch("https://sso.chaster.app/auth/realms/app/protocol/openid-connect/token", {
            method: "POST",
            headers: userAgent,
            body: new URLSearchParams({
              code: code,
              grant_type: "authorization_code",
              client_id: clientId,
              redirect_uri: "https://chaster.app/",
            }),
          });

          // FIXME:
          // Tsk tsk, TS...
          return await token.json() as Token;
        },
    },

    renderer: {},
  })