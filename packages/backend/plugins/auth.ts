// import passport from 'passport';
// import { Strategy as SamlStrategy } from 'passport-saml';
// import express from 'express';

// // Configure SAML
// passport.use(
//     new SamlStrategy(
//         {
//             path: '/auth/saml/callback',        // your callback
//             entryPoint: process.env.SAML_IDP_SSO_URL!,
//             issuer: process.env.SAML_ISSUER!,
//             // cert: process.env.SAML_IDP_CERT,     // IdP certificate
//         },
//         (profile: any, done: any) => {
//             // profile contains SAML attributes — map as needed
//             const user = {
//                 id: profile.nameID,
//                 email: profile.email || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
//             };
//             done(null, user);
//         },
//     ),
// );

// export const createSamlRouter = () => {
//     const router = express.Router();

//     router.use(passport.initialize());

//     // Trigger SAML login
//     router.get('/auth/saml', passport.authenticate('saml'));

//     // Callback from IdP
//     router.post(
//         '/auth/saml/callback',
//         passport.authenticate('saml', {
//             failureRedirect: '/login',
//             successRedirect: '/',
//         }),
//     );

//     return router;
// };