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
import { useNavigate } from 'react-router-dom';
import { DbSetupPage } from '@internal/backstage-plugin-db-setup';

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
        'select' | 'ldap' | 'github' | 'google' | 'register'
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

    if (mode === 'register') {
        return (
            <AuthLayout
                title="Register"
                onBack={() => setMode('select')}
            >
                <DbSetupPage onBack={() => setMode('select')}
                    onSetupComplete={() => setMode('select')} />
            </AuthLayout>
        );
    }

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
                            <Typography align="center" variant="body2">
                                OR
                            </Typography>
                        </Box>

                        {/* SSO */}
                        <Typography variant="subtitle1">
                            Single Sign-On
                        </Typography>
                        {/* 
                        <Box mt={1}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => setMode('github')}
                            >
                                Continue with GitHub
                            </Button>
                        </Box> */}

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
                                SAML
                            </Button>
                        </Box>
                    </CardContent>

                    <Box mt={3} pt={2} borderTop="1px solid #444">
                        <Typography
                            variant="body2"
                            align="center"
                            style={{ color: '#bbb' }}
                        >
                            New to Allied Globetech API Developer Portal?
                        </Typography>

                        <Box mt={1} textAlign="center">
                            <Button
                                color="primary"
                                size="small"
                                onClick={() => setMode('register')}
                            >
                                Register here
                            </Button>
                        </Box>
                    </Box>

                </Card>
            </Box >
        </Box >
    );
};