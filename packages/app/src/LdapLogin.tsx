import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Divider,
    Tabs,
    Tab,
} from '@material-ui/core';
import { LdapAuthFrontendPage } from '@immobiliarelabs/backstage-plugin-ldap-auth';

const LdapLogin = (props: any) => {
    return (
        <LdapAuthFrontendPage
            {...props}
            provider="ldap"
        />
    );
};

export default LdapLogin;