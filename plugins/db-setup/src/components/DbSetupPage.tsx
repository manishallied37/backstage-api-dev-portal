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
    Grid,
    Typography,
    Stepper,
    Step,
    StepLabel,
    CircularProgress,
} from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import { useApi, discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';

type DbSetupPageProps = {
    onBack?: () => void;
    onSetupComplete?: () => void;
};

export const DbSetupPage = ({ onBack, onSetupComplete }: DbSetupPageProps) => {
    // const navigate = useNavigate();
    const discoveryApi = useApi(discoveryApiRef);
    const fetchApi = useApi(fetchApiRef);

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [dbForm, setDbForm] = useState({
        host: '',
        port: '',
        database: '',
        user: '',
        password: '',
    });

    const [superUser, setSuperUser] = useState({
        username: '',
        email: '',
        password: '',
    });

    const steps = ['Database', 'Admin User', 'Complete'];

    const isPortValid = (port: string) => {
        const portNum = Number(port);
        return portNum > 0 && portNum <= 65535;
    };

    const handleTestConnection = async () => {

        setLoading(true);
        setConnected(false);
        setErrorMessage('');
        setSuccessMessage('');

        if (!isPortValid(dbForm.port)) {
            setErrorMessage('Invalid port number');
            setLoading(false);
            return;
        }

        try {
            const baseUrl = await discoveryApi.getBaseUrl('db-setup');
            const res = await fetch(`${baseUrl}/test-db`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...dbForm,
                    port: Number(dbForm.port),
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setConnected(true);
                setSuccessMessage('Database connection successful');
            } else {
                setErrorMessage(data.error || 'Database connection failed');
            }

        } catch (error: any) {
            setErrorMessage(error.message || 'Unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const baseUrl = await discoveryApi.getBaseUrl('db-setup');

            const res = await fetch(`${baseUrl}/save-db`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dbDetails: dbForm,
                    superUser,
                }),
            });

            let data;
            try {
                data = await res.json();
            } catch {
                data = { success: false, error: 'Invalid server response' };
            }

            if (res.ok && data.success) {
                setActiveStep(2);
                setTimeout(() => {
                    if (onSetupComplete) {
                        window.location.reload();
                    }
                }, 1500);
            } else {
                setErrorMessage(data.error || 'Failed to complete setup');
            }

        } catch (error: any) {
            setErrorMessage(error.message || 'Unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const isDbFormValid =
        dbForm.host &&
        dbForm.database &&
        dbForm.user &&
        dbForm.password &&
        isPortValid(dbForm.port);

    const isAdminValid =
        superUser.username && superUser.email &&
        superUser.password;

    return (
        <Page themeId="tool">
            {/* <Header
                title="Allied Globetech LLP API Developer Portal"
                subtitle="Initial database configuration and admin setup"
            >
                {onBack && (
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={onBack}
                        style={{ marginTop: 16 }}
                    >
                        Back
                    </Button>
                )}
            </Header> */}
            <Content>
                <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12} md={8} lg={6}>
                        <Card>
                            <CardContent>

                                <Stepper activeStep={activeStep} alternativeLabel>
                                    {steps.map(label => (
                                        <Step key={label}>
                                            <StepLabel>{label}</StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>

                                {activeStep === 0 && (
                                    <Grid container spacing={3} style={{ marginTop: 16 }}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Host"
                                                value={dbForm.host}
                                                onChange={e =>
                                                    setDbForm({ ...dbForm, host: e.target.value })
                                                }
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Port"
                                                error={!isPortValid(dbForm.port) && dbForm.port !== ''}
                                                helperText={
                                                    !isPortValid(dbForm.port) && dbForm.port !== ''
                                                        ? 'Enter valid port (1-65535)'
                                                        : ''
                                                }
                                                value={dbForm.port}
                                                onChange={e =>
                                                    setDbForm({ ...dbForm, port: e.target.value })
                                                }
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Database"
                                                value={dbForm.database}
                                                onChange={e =>
                                                    setDbForm({ ...dbForm, database: e.target.value })
                                                }
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="User"
                                                value={dbForm.user}
                                                onChange={e =>
                                                    setDbForm({ ...dbForm, user: e.target.value })
                                                }
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                type="password"
                                                label="Password"
                                                value={dbForm.password}
                                                onChange={e =>
                                                    setDbForm({ ...dbForm, password: e.target.value })
                                                }
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleTestConnection}
                                                disabled={loading || !isDbFormValid}
                                            >
                                                {loading ? <CircularProgress size={20} /> : 'Test Connection'}
                                            </Button>

                                            <Button
                                                style={{ marginLeft: 16 }}
                                                variant="contained"
                                                color="primary"
                                                disabled={!connected}
                                                onClick={() => setActiveStep(1)}
                                            >
                                                Next
                                            </Button>
                                        </Grid>

                                        {successMessage && (
                                            <Grid item xs={12}>
                                                <Typography color="primary">
                                                    {successMessage}
                                                </Typography>
                                            </Grid>
                                        )}

                                        {errorMessage && (
                                            <Grid item xs={12}>
                                                <Typography color="error">
                                                    {errorMessage}
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                )}

                                {activeStep === 1 && (
                                    <Grid container spacing={3} style={{ marginTop: 16 }}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Admin Username"
                                                value={superUser.username}
                                                onChange={e =>
                                                    setSuperUser({
                                                        ...superUser,
                                                        username: e.target.value,
                                                    })
                                                }
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Admin Email"
                                                type="email"
                                                value={superUser.email}
                                                onChange={e =>
                                                    setSuperUser({
                                                        ...superUser,
                                                        email: e.target.value,
                                                    })
                                                }
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                type="password"
                                                label="Admin Password"
                                                value={superUser.password}
                                                onChange={e =>
                                                    setSuperUser({
                                                        ...superUser,
                                                        password: e.target.value,
                                                    })
                                                }
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Button onClick={() => setActiveStep(0)}>
                                                Back
                                            </Button>

                                            <Button
                                                style={{ marginLeft: 16 }}
                                                variant="contained"
                                                color="primary"
                                                disabled={!isAdminValid || loading}
                                                onClick={handleSave}
                                            >
                                                {loading ? <CircularProgress size={20} /> : 'Finish Setup'}
                                            </Button>
                                        </Grid>

                                        {errorMessage && (
                                            <Grid item xs={12}>
                                                <Typography color="error">
                                                    {errorMessage}
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                )}

                                {activeStep === 2 && (
                                    <Grid container spacing={3} style={{ marginTop: 16 }}>
                                        <Grid item xs={12}>
                                            <Typography variant="h6">
                                                Setup Completed Successfully 🎉
                                            </Typography>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => window.location.href = '/'}
                                            >
                                                Launch Application
                                            </Button>
                                        </Grid>

                                    </Grid>
                                )}

                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Content>
        </Page>
    );
};