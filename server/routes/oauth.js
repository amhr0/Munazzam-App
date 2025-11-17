import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import axios from 'axios';

const router = express.Router();

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback';

// Microsoft OAuth Configuration
const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || 'YOUR_MICROSOFT_CLIENT_ID';
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET || 'YOUR_MICROSOFT_CLIENT_SECRET';
const MICROSOFT_REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:5173/auth/microsoft/callback';

// Google OAuth - Get Authorization URL
router.get('/google/url', (req, res) => {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/gmail.readonly'
    ];
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scopes.join(' '))}&` +
        `access_type=offline&` +
        `prompt=consent`;
    
    res.json({ success: true, url: authUrl });
});

// Google OAuth - Handle Callback
router.post('/google/callback', async (req, res) => {
    try {
        const { code } = req.body;
        
        // Exchange code for tokens
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code'
        });
        
        const { access_token, refresh_token } = tokenResponse.data;
        
        // Get user info
        const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        });
        
        const { email, name, id: googleId } = userInfoResponse.data;
        
        // Find or create user
        let user = await User.findOne({ email });
        
        if (!user) {
            user = new User({
                name,
                email,
                oauthProvider: 'google',
                oauthId: googleId,
                userType: 'business',
                calendarIntegrations: {
                    google: {
                        accessToken: access_token,
                        refreshToken: refresh_token,
                        enabled: true
                    }
                },
                emailIntegrations: {
                    google: {
                        accessToken: access_token,
                        refreshToken: refresh_token,
                        enabled: true
                    }
                }
            });
            await user.save();
        } else {
            // Update existing user with OAuth tokens
            user.calendarIntegrations.google = {
                accessToken: access_token,
                refreshToken: refresh_token,
                enabled: true
            };
            user.emailIntegrations.google = {
                accessToken: access_token,
                refreshToken: refresh_token,
                enabled: true
            };
            await user.save();
        }
        
        // Generate JWT
        const token = jwt.sign(
            { id: user._id, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType
            }
        });
        
    } catch (error) {
        console.error('Google OAuth Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'فشل تسجيل الدخول عبر Google',
            error: error.message
        });
    }
});

// Microsoft OAuth - Get Authorization URL
router.get('/microsoft/url', (req, res) => {
    const scopes = [
        'openid',
        'profile',
        'email',
        'Calendars.ReadWrite',
        'Mail.Read'
    ];
    
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${MICROSOFT_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(MICROSOFT_REDIRECT_URI)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scopes.join(' '))}&` +
        `response_mode=query`;
    
    res.json({ success: true, url: authUrl });
});

// Microsoft OAuth - Handle Callback
router.post('/microsoft/callback', async (req, res) => {
    try {
        const { code } = req.body;
        
        // Exchange code for tokens
        const tokenResponse = await axios.post(
            'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            new URLSearchParams({
                code,
                client_id: MICROSOFT_CLIENT_ID,
                client_secret: MICROSOFT_CLIENT_SECRET,
                redirect_uri: MICROSOFT_REDIRECT_URI,
                grant_type: 'authorization_code'
            }),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );
        
        const { access_token, refresh_token } = tokenResponse.data;
        
        // Get user info
        const userInfoResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
            headers: { Authorization: `Bearer ${access_token}` }
        });
        
        const { mail, displayName, id: microsoftId } = userInfoResponse.data;
        
        // Find or create user
        let user = await User.findOne({ email: mail });
        
        if (!user) {
            user = new User({
                name: displayName,
                email: mail,
                oauthProvider: 'microsoft',
                oauthId: microsoftId,
                userType: 'business',
                calendarIntegrations: {
                    microsoft: {
                        accessToken: access_token,
                        refreshToken: refresh_token,
                        enabled: true
                    }
                },
                emailIntegrations: {
                    microsoft: {
                        accessToken: access_token,
                        refreshToken: refresh_token,
                        enabled: true
                    }
                }
            });
            await user.save();
        } else {
            // Update existing user with OAuth tokens
            user.calendarIntegrations.microsoft = {
                accessToken: access_token,
                refreshToken: refresh_token,
                enabled: true
            };
            user.emailIntegrations.microsoft = {
                accessToken: access_token,
                refreshToken: refresh_token,
                enabled: true
            };
            await user.save();
        }
        
        // Generate JWT
        const token = jwt.sign(
            { id: user._id, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType
            }
        });
        
    } catch (error) {
        console.error('Microsoft OAuth Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'فشل تسجيل الدخول عبر Microsoft',
            error: error.message
        });
    }
});

export default router;
