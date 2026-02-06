// import React, { useState } from 'react';
// import {
//     Box,
//     Card,
//     CardContent,
//     Typography,
//     Button,
//     Divider,
//     Tabs,
//     Tab,
// } from '@material-ui/core';
// import {
//     SignInPage
// } from '@backstage/core-components';
// import {
//     googleAuthApiRef,
//     githubAuthApiRef,
// } from '@backstage/core-plugin-api';

// import LdapLogin from './LdapLogin';

// export const CustomSignInPage = (props: any) => {

//     const [mode, setMode] = useState<
//         'select' | 'ldap' | 'github' | 'google'
//     >('select');

//     if (mode === 'ldap') {
//         return (
//             <LdapLogin
//                 props={props}
//                 onBack={() => setMode('select')}
//             />
//         );
//     }

//     if (mode === 'github') {
//         return (
//             <SignInPage
//                 {...props}
//                 providers={[
//                     {
//                         id: 'github-auth-provider',
//                         title: 'Github',
//                         message: 'Sign In using Github',
//                         apiRef: githubAuthApiRef,
//                     }
//                 ]}
//             />
//         );
//     }

//     if (mode === 'google') {
//         return (
//             <SignInPage
//                 {...props}
//                 providers={[
//                     {
//                         id: 'google-auth-provider',
//                         title: 'Google',
//                         message: 'Sign In using Google',
//                         apiRef: googleAuthApiRef,
//                     }
//                 ]}
//             />
//         );
//     }

//     return (
//         <Box height="100vh" bgcolor="#2e2e2e">
//             {/* Top Banner */}
//             <Box
//                 px={3}
//                 py={2}
//                 style={{
//                     background: 'linear-gradient(135deg, #00695c 0%, #004d40 100%)',
//                 }}
//             >
//                 <Typography variant="h5" style={{ color: '#fff' }}>
//                     Allied Globetech API Developer Portal
//                 </Typography>
//             </Box>

//             {/* Center Card */}
//             <Box
//                 display="flex"
//                 justifyContent="center"
//                 alignItems="center"
//                 height="calc(100vh - 64px)"
//             >
//                 <Card elevation={8} style={{ width: 360 }}>
//                     <CardContent>
//                         {/* LDAP */}
//                         <Typography variant="h6">Login with LDAP</Typography>
//                         <Typography variant="body2" color="textSecondary">
//                             Use your corporate credentials
//                         </Typography>

//                         <Box mt={2}>
//                             <Button
//                                 fullWidth
//                                 variant="contained"
//                                 color="primary"
//                                 onClick={() => setMode('ldap')}
//                             >
//                                 Continue with LDAP
//                             </Button>
//                         </Box>

//                         {/* Divider */}
//                         <Box my={3}>
//                             <Divider />
//                             <Typography align="center" variant="body2">
//                                 OR
//                             </Typography>
//                         </Box>

//                         {/* SSO */}
//                         <Typography variant="subtitle1">Single Sign-On</Typography>

//                         <Tabs variant="fullWidth">
//                             <Tab label="GitHub" onClick={() => setMode('github')} />
//                             <Tab label="Google" onClick={() => setMode('google')} />
//                             <Tab label="SAML (Coming Soon)" disabled />
//                         </Tabs>
//                     </CardContent>
//                 </Card>
//             </Box>
//         </Box>
//     );
// };

import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Divider,
} from '@material-ui/core';

import { SignInPage } from '@backstage/core-components';
import {
    googleAuthApiRef,
    githubAuthApiRef,
} from '@backstage/core-plugin-api';

import LdapLogin from './LdapLogin';

/* ---------------------------
 * Shared Auth Layout
 * -------------------------- */
const AuthLayout = ({
    title,
    onBack,
    children,
}: {
    title: string;
    onBack: () => void;
    children: React.ReactNode;
}) => {
    return (
        <Box height="100vh" bgcolor="#2e2e2e">
            {/* Header */}
            <Box
                px={3}
                py={2}
                display="flex"
                alignItems="center"
                style={{
                    background: 'linear-gradient(135deg, #00695c 0%, #004d40 100%)',
                }}
            >
                <Button
                    variant="text"
                    style={{ color: '#fff', marginRight: 16 }}
                    onClick={onBack}
                >
                    ← Back
                </Button>

                <Typography variant="h6" style={{ color: '#fff' }}>
                    {title}
                </Typography>
            </Box>

            {/* Content */}
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="calc(100vh - 64px)"
            >
                {children}
            </Box>
        </Box>
    );
};

/* ---------------------------
 * Custom Sign In Page
 * -------------------------- */
export const CustomSignInPage = (props: any) => {
    const [mode, setMode] = useState<
        'select' | 'ldap' | 'github' | 'google'
    >('select');

    /* -------- LDAP -------- */
    if (mode === 'ldap') {
        return (
            <AuthLayout
                title="LDAP Sign In"
                onBack={() => setMode('select')}
            >
                <LdapLogin
                    props={props}
                    onBack={() => setMode('select')}
                />
            </AuthLayout>
        );
    }

    /* -------- GitHub -------- */
    if (mode === 'github') {
        return (
            <AuthLayout
                title="GitHub Sign In"
                onBack={() => setMode('select')}
            >
                <Box width={400}>
                    <SignInPage
                        {...props}
                        providers={[
                            {
                                id: 'github-auth-provider',
                                title: 'GitHub',
                                message: 'Sign in using GitHub',
                                apiRef: githubAuthApiRef,
                            },
                        ]}
                    />
                </Box>
            </AuthLayout>
        );
    }

    /* -------- Google -------- */
    if (mode === 'google') {
        return (
            <AuthLayout
                title="Google Sign In"
                onBack={() => setMode('select')}
            >
                <Box width={400}>
                    <SignInPage
                        {...props}
                        providers={[
                            {
                                id: 'google-auth-provider',
                                title: 'Google',
                                message: 'Sign in using Google',
                                apiRef: googleAuthApiRef,
                            },
                        ]}
                    />
                </Box>
            </AuthLayout>
        );
    }

    /* -------- Default Selector -------- */
    return (
        <Box height="100vh" bgcolor="#2e2e2e">
            {/* Top Banner */}
            <Box
                px={3}
                py={2}
                style={{
                    background: 'linear-gradient(135deg, #00695c 0%, #004d40 100%)',
                }}
            >
                <Typography variant="h5" style={{ color: '#fff' }}>
                    Allied Globetech API Developer Portal
                </Typography>
            </Box>

            {/* Center Card */}
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="calc(100vh - 64px)"
            >
                <Card elevation={8} style={{ width: 360 }}>
                    <CardContent>
                        {/* LDAP */}
                        <Typography variant="h6">Login with LDAP</Typography>
                        <Typography variant="body2" color="textSecondary">
                            Use your corporate credentials
                        </Typography>

                        <Box mt={2}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={() => setMode('ldap')}
                            >
                                Continue with LDAP
                            </Button>
                        </Box>

                        {/* Divider */}
                        <Box my={3}>
                            <Divider />
                            <Typography align="center" variant="body2">
                                OR
                            </Typography>
                        </Box>

                        {/* SSO */}
                        <Typography variant="subtitle1">
                            Single Sign-On
                        </Typography>

                        <Box mt={1}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => setMode('github')}
                            >
                                Continue with GitHub
                            </Button>
                        </Box>

                        <Box mt={1}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => setMode('google')}
                            >
                                Continue with Google
                            </Button>
                        </Box>

                        <Box mt={1}>
                            <Button
                                fullWidth
                                variant="outlined"
                                disabled
                            >
                                SAML (Coming Soon)
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};