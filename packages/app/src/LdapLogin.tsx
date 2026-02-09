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

type Props = {
    props: any;
    onBack: () => void;
};

const LdapLogin = ({ props, onBack }: Props) => {
    return (
        <Box height="100vh">
            <LdapAuthFrontendPage
                {...props}
                provider="ldap"
            />
        </Box>
    );
};

export default LdapLogin;