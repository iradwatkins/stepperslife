#!/bin/bash

# One-Command Deployment Script
# Copy and paste this entire command into your terminal

ssh root@72.60.28.175 'cd /opt && rm -rf stepperslife && git clone https://github.com/iradwatkins/stepperslife.git && cd stepperslife && chmod +x DEPLOY_FINAL.sh && ./DEPLOY_FINAL.sh'