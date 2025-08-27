const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');

const app = express();
const PORT = 9000;
const WEBHOOK_SECRET = 'stepperslife-deploy-2024'; // Change this to a secure secret

app.use(express.json());

// GitHub webhook endpoint
app.post('/webhook/github', (req, res) => {
    const signature = req.headers['x-hub-signature-256'];
    
    // Verify webhook signature (optional but recommended)
    if (signature) {
        const hash = 'sha256=' + crypto
            .createHmac('sha256', WEBHOOK_SECRET)
            .update(JSON.stringify(req.body))
            .digest('hex');
        
        if (signature !== hash) {
            return res.status(401).send('Unauthorized');
        }
    }
    
    // Check if it's a push to main/master branch
    const branch = req.body.ref;
    if (branch === 'refs/heads/main' || branch === 'refs/heads/master') {
        console.log('🚀 Deploying SteppersLife from GitHub push...');
        
        // Execute deploy script
        exec('/var/www/stepperslife-github/deploy.sh', (error, stdout, stderr) => {
            if (error) {
                console.error('Deploy error:', error);
                return res.status(500).json({ error: 'Deploy failed', details: stderr });
            }
            
            console.log('Deploy output:', stdout);
            res.json({ 
                success: true, 
                message: 'Deployment triggered successfully',
                output: stdout 
            });
        });
    } else {
        res.json({ message: 'Not deploying - push was not to main/master branch' });
    }
});

// Manual deploy endpoint
app.post('/deploy', (req, res) => {
    console.log('🚀 Manual deploy triggered...');
    
    exec('/var/www/stepperslife-github/deploy.sh', (error, stdout, stderr) => {
        if (error) {
            console.error('Deploy error:', error);
            return res.status(500).json({ error: 'Deploy failed', details: stderr });
        }
        
        console.log('Deploy output:', stdout);
        res.json({ 
            success: true, 
            message: 'Manual deployment completed',
            output: stdout 
        });
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'stepperslife-webhook' });
});

app.listen(PORT, () => {
    console.log(`Webhook server listening on port ${PORT}`);
    console.log(`GitHub webhook: http://deploy.agistaffers.com:${PORT}/webhook/github`);
    console.log(`Manual deploy: http://deploy.agistaffers.com:${PORT}/deploy`);
});