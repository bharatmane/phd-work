// PhD Research Platform — build + deploy pipeline.
//
// Single environment (Production only — phd.dgtula.com / phd.bharatmane.com).
// Auto-deploys on every push to main (DEPLOY_PROD defaults to true so the
// GitHub-push-triggered build, which always runs with parameter defaults,
// deploys without manual intervention — matches the job's existing
// "auto deploy on push to main" behaviour).
//
// Frontend uses a releases-dir + symlink-swap layout (same pattern as the
// dhanman-app pipeline) for instant rollback. The API's Docker image is
// tagged per-build for the same reason. Model checkpoints in
// /opt/phd-api/artifacts are persistent and are never touched by a deploy
// or a rollback — only code/image versions move.
//
// Required Jenkins credentials (already configured on this instance):
//   phd-github-pat   — GitHub PAT for checkout (this repo)
//   DO_FALLBACK_HOST — secret text, resolves to 57.129.74.139
//   DO_USER          — secret text, SSH username
//   DO_SSH_KEY       — SSH private key credential

pipeline {
    agent any
    tools {
        nodejs 'Node_18'
    }
    options {
        buildDiscarder(logRotator(daysToKeepStr: '14', numToKeepStr: '20'))
    }
    parameters {
        string(name: 'BRANCH_TO_DEPLOY', defaultValue: '', description: 'Branch to deploy (leave blank for default)')
        booleanParam(name: 'DEPLOY_PROD', defaultValue: true, description: 'Deploy to production? (true on every push to main)')
        string(name: 'ROLLBACK_VERSION', defaultValue: '', description: 'Rollback to this release (e.g. 0.1.0-b42-a3f9c1d). Skips build — repoints the frontend symlink and re-runs the API container from the matching image tag.')
    }
    environment {
        DO_FALLBACK_HOST = credentials('DO_FALLBACK_HOST')
        DO_USER           = credentials('DO_USER')
        DO_SSH_KEY_ID     = 'DO_SSH_KEY'
        VITE_API_URL      = 'https://phd.dgtula.com/api'
        WEB_RELEASES_DIR  = '/var/www/phd-releases'
        WEB_LIVE_LINK     = '/var/www/phd'
        API_DIR           = '/opt/phd-api'
        API_IMAGE         = 'iraf-api'
        API_CONTAINER     = 'iraf-api'
    }

    stages {

        stage('Checkout') {
            steps {
                script {
                    if (params.BRANCH_TO_DEPLOY?.trim()) {
                        checkout([
                            $class: 'GitSCM',
                            branches: [[name: params.BRANCH_TO_DEPLOY]],
                            userRemoteConfigs: [[
                                url: 'https://github.com/bharatmane/phd-work.git',
                                credentialsId: 'phd-github-pat'
                            ]]
                        ])
                        echo "Checked out branch: ${params.BRANCH_TO_DEPLOY}"
                    } else {
                        checkout scm
                        echo "Checked out default branch"
                    }
                }
            }
        }

        // -----------------------------------------------------------------
        // Rollback — repoints the frontend symlink and re-runs the API
        // container from an existing tagged image. No build, no transfer.
        // Trigger: set ROLLBACK_VERSION + DEPLOY_PROD = true.
        // -----------------------------------------------------------------
        stage('Rollback Production') {
            when {
                allOf {
                    expression { return params.ROLLBACK_VERSION?.trim() }
                    expression { return params.DEPLOY_PROD }
                }
            }
            steps {
                script {
                    def version = params.ROLLBACK_VERSION.trim()

                    sshagent(credentials: [env.DO_SSH_KEY_ID]) {
                        sh """
                            ssh -o StrictHostKeyChecking=no ${DO_USER}@${DO_FALLBACK_HOST} 'bash -s' <<'ENDSSH'
set -e
VERSION="${version}"

echo "--- Rolling back frontend to \$VERSION ---"
RELEASES_DIR=${WEB_RELEASES_DIR}
if [ ! -d "\$RELEASES_DIR/\$VERSION" ]; then
  echo "ERROR: frontend release \$VERSION not found. Available releases:"
  ls -1dt "\$RELEASES_DIR"/*/ 2>/dev/null | sed 's|.*/||'
  exit 1
fi
sudo ln -sfn "\$RELEASES_DIR/\$VERSION" ${WEB_LIVE_LINK}.new
sudo mv -Tf ${WEB_LIVE_LINK}.new ${WEB_LIVE_LINK}
echo "Frontend rolled back to \$VERSION"

echo "--- Rolling back API to \$VERSION ---"
if ! sudo docker image inspect ${API_IMAGE}:\$VERSION >/dev/null 2>&1; then
  echo "ERROR: API image ${API_IMAGE}:\$VERSION not found. Available tags:"
  sudo docker images ${API_IMAGE} --format '{{.Tag}}'
  exit 1
fi
sudo docker stop ${API_CONTAINER} || true
sudo docker rm ${API_CONTAINER} || true
sudo docker run -d --name ${API_CONTAINER} --restart unless-stopped \
  -p 8000:8000 \
  -v ${API_DIR}/artifacts:/app/artifacts \
  ${API_IMAGE}:\$VERSION
echo "API rolled back to \$VERSION"
ENDSSH
                        """
                    }
                }
            }
        }

        stage('Setup Node.js') {
            when {
                not { expression { return params.ROLLBACK_VERSION?.trim() } }
            }
            steps {
                sh '''
                    node -v
                    npm -v
                '''
            }
        }

        stage('Build Frontend') {
            when {
                not { expression { return params.ROLLBACK_VERSION?.trim() } }
            }
            steps {
                dir('apps/web') {
                    sh '''
                        echo "======================================"
                        echo "    FRONTEND BUILD STARTED"
                        echo "======================================"

                        rm -rf node_modules dist
                        npm ci

                        VITE_APP_VERSION="$(node -p "require('./package.json').version")-b${BUILD_NUMBER}-$(git rev-parse --short HEAD)"
                        export VITE_APP_VERSION
                        echo "Building version: $VITE_APP_VERSION"
                        VITE_API_URL="${VITE_API_URL}" npm run build

                        echo "$VITE_APP_VERSION" > ../../.app_version
                        echo "Build completed. Dist contents:"
                        ls -la dist/
                    '''
                }
            }
        }

        stage('Deploy Frontend') {
            when {
                not { expression { return params.ROLLBACK_VERSION?.trim() } }
            }
            steps {
                script {
                    def version = sh(script: 'cat .app_version', returnStdout: true).trim()
                    sshagent(credentials: [env.DO_SSH_KEY_ID]) {
                        sh """
                            tar -czf frontend-dist.tar.gz -C apps/web/dist .
                            scp -o StrictHostKeyChecking=no frontend-dist.tar.gz ${DO_USER}@${DO_FALLBACK_HOST}:/tmp/
                            ssh -o StrictHostKeyChecking=no ${DO_USER}@${DO_FALLBACK_HOST} 'bash -s' <<'ENDSSH'
set -e
VERSION="${version}"
RELEASES_DIR=${WEB_RELEASES_DIR}
RELEASE_PATH=\$RELEASES_DIR/\$VERSION
sudo mkdir -p "\$RELEASE_PATH"
sudo tar -xzf /tmp/frontend-dist.tar.gz -C "\$RELEASE_PATH"
sudo rm -f /tmp/frontend-dist.tar.gz
sudo chown -R www-data:www-data "\$RELEASE_PATH"

# One-time migration: if the live path is still a flat directory (pre-dates
# this pipeline), preserve it instead of clobbering it.
if [ -d "${WEB_LIVE_LINK}" ] && [ ! -L "${WEB_LIVE_LINK}" ]; then
  sudo mv "${WEB_LIVE_LINK}" "${WEB_LIVE_LINK}.legacy.\$(date +%Y%m%d%H%M%S)"
fi

sudo ln -sfn "\$RELEASE_PATH" ${WEB_LIVE_LINK}.new
sudo mv -Tf ${WEB_LIVE_LINK}.new ${WEB_LIVE_LINK}

# Keep the last 10 releases.
ls -dt \$RELEASES_DIR/*/ 2>/dev/null | tail -n +11 | sudo xargs -r rm -rf
echo "✓ Frontend deployed: \$VERSION"
ENDSSH
                        """
                    }
                }
                sh 'rm -rf apps/web/node_modules apps/web/dist frontend-dist.tar.gz'
            }
        }

        // -----------------------------------------------------------------
        // API — only rebuilds when apps/api/** changed. Image is tagged
        // with the same VERSION as the frontend release for traceability,
        // plus :latest. Checkpoints in artifacts/ are never overwritten.
        // -----------------------------------------------------------------
        stage('Build and Deploy API') {
            when {
                allOf {
                    changeset 'apps/api/**'
                    not { expression { return params.ROLLBACK_VERSION?.trim() } }
                }
            }
            steps {
                script {
                    def version = sh(script: 'cat .app_version', returnStdout: true).trim()
                    sshagent(credentials: [env.DO_SSH_KEY_ID]) {
                        sh """
                            tar -czf api-src.tar.gz --exclude='__pycache__' --exclude='artifacts' -C apps/api .
                            scp -o StrictHostKeyChecking=no api-src.tar.gz ${DO_USER}@${DO_FALLBACK_HOST}:/tmp/
                            ssh -o StrictHostKeyChecking=no ${DO_USER}@${DO_FALLBACK_HOST} 'bash -s' <<'ENDSSH'
set -e
VERSION="${version}"
API_DIR=${API_DIR}

sudo mkdir -p "\$API_DIR"
sudo tar -xzf /tmp/api-src.tar.gz -C "\$API_DIR"
sudo rm -f /tmp/api-src.tar.gz
sudo mkdir -p "\$API_DIR/artifacts"   # never deleted, never overwritten by deploy

cd "\$API_DIR"
sudo docker build --network=host -t ${API_IMAGE}:\$VERSION -t ${API_IMAGE}:latest .

sudo docker stop ${API_CONTAINER} || true
sudo docker rm ${API_CONTAINER} || true
sudo docker run -d --name ${API_CONTAINER} --restart unless-stopped \
  -p 8000:8000 \
  -v "\$API_DIR/artifacts:/app/artifacts" \
  ${API_IMAGE}:\$VERSION

# Keep the last 10 versioned images (latest is exempt).
sudo docker images ${API_IMAGE} --format '{{.Tag}}' \
  | grep -v '^latest\$' | sort -r | tail -n +11 \
  | xargs -r -I{} sudo docker rmi ${API_IMAGE}:{} || true

echo "✓ API deployed: \$VERSION"
ENDSSH
                        """
                    }
                }
                sh 'rm -f api-src.tar.gz'
            }
        }

        stage('Verify Production Deployment') {
            when {
                expression { return params.DEPLOY_PROD }
            }
            steps {
                sh '''
                    echo "Verifying production deployment..."
                    sleep 5
                    curl -fL https://phd.dgtula.com || exit 1
                    curl -f https://phd.dgtula.com/api/health || exit 1
                    echo "✓ Production verification successful"
                '''
            }
        }
    }

    post {
        always {
            script {
                try { cleanWs() } catch (e) { echo "cleanWs skipped: ${e.message}" }
            }
        }
        failure {
            echo '❌ Deployment failed!'
        }
        success {
            echo '✅ Deployment succeeded!'
        }
    }
}
