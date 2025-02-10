import { baseEnvironment } from "./base-environment";

export const environment = {
    ...baseEnvironment,
    production: false,
    apiUrl: 'http://89.58.39.164:5000', // base url for APIs
    logging: true, // allow logging
    featureFlag: true, // run experimental features
};
