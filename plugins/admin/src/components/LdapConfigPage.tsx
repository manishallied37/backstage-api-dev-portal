import React, { useState } from 'react';
import {
    Page,
    Header,
    Content,
} from '@backstage/core-components';
import {
    Card,
    CardContent,
    TextField,
    Button,
    MenuItem,
    Grid,
    Typography,
} from '@material-ui/core';
import { useApi, discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';

export const LdapConfigPage = () => {
    const [url, setUrl] = useState('');
    const [dn, setDn] = useState('');
    const [password, setPassword] = useState('');

    const [fullName, setFullName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('user');
    const [userPassword, setUserPassword] = useState('');

    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'failed'>('idle');
    const [userCreationStatus, setUserCreationStatus] = useState<'idle' | 'success' | 'failed'>('idle');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [userDn, setUserDn] = useState('');
    const [ouValid, setOuValid] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [ouErrorMessage, setOuErrorMessage] = useState('');

    const discoveryApi = useApi(discoveryApiRef);
    const fetchApi = useApi(fetchApiRef);
    const isValidDn = (Dn: string) => /^(\w+=[\w.-]+,?)+$/i.test(Dn);

    const handleTestConnection = async () => {
        setLoading(true);
        setConnectionStatus('idle');
        setErrorMessage('');

        try {
            const baseUrl = await discoveryApi.getBaseUrl('admin');
            const response = await fetchApi.fetch(`${baseUrl}/ldap/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, dn, password }),
            });

            const data = await response.json();
            if (data.success) {
                setConnectionStatus('success');
                setErrorMessage('');
            } else {
                setConnectionStatus('failed');
                setErrorMessage(data.error || 'Unknown error');
            }
        } catch (error: any) {
            setConnectionStatus('failed');
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setUserCreationStatus('idle');
        setErrorMessage('');

        try {
            if (ouValid !== 'valid') {
                setUserCreationStatus('failed');
                setErrorMessage('Cannot create user: OU is invalid');
                setLoading(false);
                return;
            }

            const baseUrl = await discoveryApi.getBaseUrl('admin');

            const response = await fetchApi.fetch(`${baseUrl}/ldap/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url,
                    bindDn: dn,
                    bindPassword: password,
                    userDn,
                    attributes: {
                        cn: fullName,
                        sn: lastName,
                        uid: username,
                        mail: email,
                        objectClass: ['inetOrgPerson', 'top'],
                        userPassword,
                    },
                }),
            });

            const data = await response.json();

            if (data.success) {
                setUserCreationStatus('success');
                setFullName('');
                setLastName('');
                setUsername('');
                setEmail('');
                setUserDn('');
                setUserPassword('');
            } else {
                setUserCreationStatus('failed');
                setErrorMessage(data.error || 'Unknown error');
            }

        } catch (error: any) {
            setUserCreationStatus('failed');
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };


    const validateOu = async (dnToCheck: string) => {
        if (!dnToCheck.includes(',')) {
            setOuValid('invalid');
            setOuErrorMessage('Invalid DN format');
            return;
        }

        const ouDn = dnToCheck.split(',').slice(1).join(',');

        try {
            const baseUrl = await discoveryApi.getBaseUrl('admin');
            const response = await fetchApi.fetch(`${baseUrl}/ldap/check-ou`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, bindDn: dn, bindPassword: password, ouDn }),
            });
            const data = await response.json();

            if (data.exists) {
                setOuValid('valid');
                setOuErrorMessage('');
            } else {
                setOuValid('invalid');
                setOuErrorMessage(`OU does not exist: ${ouDn}`);
            }
        } catch (error: any) {
            setOuValid('invalid');
            setOuErrorMessage(error.message);
        }
    };


    return (
        <Page themeId="tool">
            <Header title="LDAP Configuration" subtitle="Configure LDAP User Creation" />
            <Content>
                <Grid container spacing={3}>

                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">1. Test LDAP Connection</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="LDAP URL"
                                            placeholder="ldap://localhost:389"
                                            value={url}
                                            onChange={e => setUrl(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Distinguished Name (DN)"
                                            value={dn}
                                            onChange={e => setDn(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            type="password"
                                            label="LDAP Password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleTestConnection}
                                            disabled={loading}
                                        >
                                            {loading ? 'Testing...' : 'Test Connection'}
                                        </Button>

                                        {connectionStatus === 'success' && (
                                            <Typography style={{ marginLeft: 16 }} color="primary">
                                                Connection Successful
                                            </Typography>
                                        )}
                                        {connectionStatus === 'failed' && (
                                            <Typography style={{ marginLeft: 16 }} color="error">
                                                Connection Failed: {errorMessage}
                                            </Typography>
                                        )}
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">2. Create LDAP User</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Full Name"
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Last Name"
                                            value={lastName}
                                            onChange={e => setLastName(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Username"
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="User DN (Directory Path)"
                                            placeholder="uid=jdoe,ou=developers,dc=example,dc=com"
                                            value={userDn}
                                            onChange={e => {
                                                setUserDn(e.target.value);
                                                setOuValid('idle');
                                            }}
                                            onBlur={() => validateOu(userDn)}
                                            error={ouValid === 'invalid'}
                                            helperText={ouValid === 'invalid' ? ouErrorMessage : ''}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            type="password"
                                            label="User Password"
                                            value={userPassword}
                                            onChange={e => setUserPassword(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            select
                                            fullWidth
                                            label="Role"
                                            value={role}
                                            onChange={e => setRole(e.target.value)}
                                        >
                                            <MenuItem value="admin">Admin</MenuItem>
                                            <MenuItem value="user">User</MenuItem>
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={handleSave}
                                            disabled={loading || !isValidDn(userDn)}
                                        >
                                            {loading ? 'Creating...' : 'Save Configuration'}
                                        </Button>

                                        {userCreationStatus === 'success' && (
                                            <Typography style={{ marginLeft: 16 }} color="primary">
                                                User created successfully!
                                            </Typography>
                                        )}
                                        {userCreationStatus === 'failed' && (
                                            <Typography style={{ marginLeft: 16 }} color="error">
                                                User creation failed: {errorMessage}
                                            </Typography>
                                        )}
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                </Grid>
            </Content>
        </Page>
    );
};