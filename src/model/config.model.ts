export class Config {
  tenant                   ?: string;
  clientId                  : string;
  redirectUri              ?: string;
  instance                 ?: string;
  popUp                    ?: boolean;
  localLoginUrl            ?: string;
  displayCall              ?: (urlNavigate: string) => any;
  cacheLocation            ?: string;
  anonymousEndpoints       ?: any;
  expireOffsetSeconds      ?: number;
  correlationId            ?: string;
  loginResource            ?: string;

  // If you need to send CORS api requests.
  endpoints                ?: any;

  // redirect url after succesful logout operation
  postLogoutRedirectUri    ?: string;
}