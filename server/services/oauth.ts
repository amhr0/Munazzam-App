/**
 * OAuth service for Google and Microsoft integrations
 */

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

/**
 * Google OAuth configuration
 */
export const getGoogleOAuthConfig = (): OAuthConfig => {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || `${process.env.VITE_APP_URL || 'http://localhost:3000'}/api/oauth/google/callback`,
    scopes: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  };
};

/**
 * Microsoft OAuth configuration
 */
export const getMicrosoftOAuthConfig = (): OAuthConfig => {
  return {
    clientId: process.env.MICROSOFT_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    redirectUri: process.env.MICROSOFT_REDIRECT_URI || `${process.env.VITE_APP_URL || 'http://localhost:3000'}/api/oauth/microsoft/callback`,
    scopes: [
      'https://graph.microsoft.com/Calendars.Read',
      'https://graph.microsoft.com/Mail.Read',
      'https://graph.microsoft.com/User.Read'
    ]
  };
};

/**
 * Generate Google OAuth authorization URL
 */
export function getGoogleAuthUrl(state: string): string {
  const config = getGoogleOAuthConfig();
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Generate Microsoft OAuth authorization URL
 */
export function getMicrosoftAuthUrl(state: string): string {
  const config = getMicrosoftOAuthConfig();
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state
  });
  
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
}

/**
 * Exchange Google authorization code for tokens
 */
export async function exchangeGoogleCode(code: string): Promise<OAuthTokenResponse> {
  const config = getGoogleOAuthConfig();
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google OAuth error: ${error}`);
  }

  return response.json();
}

/**
 * Exchange Microsoft authorization code for tokens
 */
export async function exchangeMicrosoftCode(code: string): Promise<OAuthTokenResponse> {
  const config = getMicrosoftOAuthConfig();
  
  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Microsoft OAuth error: ${error}`);
  }

  return response.json();
}

/**
 * Refresh Google access token
 */
export async function refreshGoogleToken(refreshToken: string): Promise<OAuthTokenResponse> {
  const config = getGoogleOAuthConfig();
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google token refresh error: ${error}`);
  }

  return response.json();
}

/**
 * Refresh Microsoft access token
 */
export async function refreshMicrosoftToken(refreshToken: string): Promise<OAuthTokenResponse> {
  const config = getMicrosoftOAuthConfig();
  
  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Microsoft token refresh error: ${error}`);
  }

  return response.json();
}

/**
 * Get user email from Google
 */
export async function getGoogleUserEmail(accessToken: string): Promise<string> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to get Google user info');
  }

  const data = await response.json();
  return data.email;
}

/**
 * Get user email from Microsoft
 */
export async function getMicrosoftUserEmail(accessToken: string): Promise<string> {
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to get Microsoft user info');
  }

  const data = await response.json();
  return data.mail || data.userPrincipalName;
}
