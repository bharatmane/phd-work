pipeline {
  agent any

  environment {
    WEB_DIST      = 'apps/web/dist'
    WEB_ROOT      = '/var/www/phd'
    API_DIR       = '/opt/phd-api'
    CONTAINER     = 'iraf-api'
    IMAGE         = 'iraf-api'
    VITE_API_URL  = 'https://phd.dgtula.com/api'
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build — React Frontend') {
      steps {
        dir('apps/web') {
          sh 'npm ci'
          sh "VITE_API_URL=${env.VITE_API_URL} npm run build"
        }
      }
    }

    stage('Deploy — React Frontend') {
      steps {
        sh "rsync -av --delete ${env.WEB_DIST}/ ${env.WEB_ROOT}/"
        sh "chown -R www-data:www-data ${env.WEB_ROOT} || true"
      }
    }

    stage('Deploy — API (if changed)') {
      when {
        changeset 'apps/api/**'
      }
      steps {
        sh """
          rsync -av --exclude '__pycache__' --exclude 'artifacts/' \
            apps/api/ ${env.API_DIR}/
        """
        sh "cd ${env.API_DIR} && docker build --network=host -t ${env.IMAGE} ."
        sh """
          docker stop ${env.CONTAINER} || true
          docker rm   ${env.CONTAINER} || true
          docker run -d --name ${env.CONTAINER} --restart unless-stopped \
            -p 8000:8000 \
            -v ${env.API_DIR}/artifacts:/app/artifacts \
            ${env.IMAGE}
        """
      }
    }

  }

  post {
    success {
      echo "Deployed successfully to https://phd.dgtula.com"
    }
    failure {
      echo "Build failed — check logs above."
    }
  }
}
