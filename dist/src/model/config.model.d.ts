export declare class Config {
    tenant?: string;
    clientId: string;
    redirectUri?: string;
    instance?: string;
    popUp?: boolean;
    localLoginUrl?: string;
    displayCall?: (urlNavigate: string) => any;
    cacheLocation?: string;
    anonymousEndpoints?: any;
    expireOffsetSeconds?: number;
    correlationId?: string;
    loginResource?: string;
    endpoints?: any;
    postLogoutRedirectUri?: string;
}
