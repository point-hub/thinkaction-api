export interface ICookieConfig {
  domain: string
  secret: string
}

export const domain = process.env['COOKIE_DOMAIN'] ?? '';
export const secret = process.env['COOKIE_SECRET'] ?? '';

const cookieConfig: ICookieConfig = {
  domain,
  secret,
};

export default cookieConfig;
