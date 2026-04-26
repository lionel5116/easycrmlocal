pipeline {
    agent any

    environment {
        NODE_HOME  = "/Users/lioneljones/.nvm/versions/node/v24.12.0"
        PATH       = "${NODE_HOME}/bin:${env.PATH}"
        NGINX_WWW  = "/opt/homebrew/var/www/easycrmlocal"
        PM2_APP    = "easycrmlocal"
        GIT_BRANCH = "main"
    }

    stages {

        stage('Environment Check') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'git --version'
                sh 'pm2 --version'
            }
        }

        stage('Build') {
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                sh '''
                    if node -e "process.exit(require('./package.json').scripts.test ? 0 : 1)" 2>/dev/null; then
                        npm test
                    else
                        echo "No test script found — running lint as smoke test"
                        npm run lint
                    fi
                '''
            }
        }

        stage('Deploy to Local Nginx') {
            steps {
                sh '''
                    rsync -a --delete \
                        --exclude='node_modules' \
                        --exclude='.git' \
                        --exclude='.next' \
                        . "${NGINX_WWW}/"

                    # Sync the .next build output separately (excluded above to avoid rsync deleting it on re-runs)
                    rsync -a .next/ "${NGINX_WWW}/.next/"

                    pm2 restart "${PM2_APP}"
                '''
                echo "Deployed. App live at http://localhost:8080"
            }
        }

        stage('Push to Git') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-credentials',
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_TOKEN'
                )]) {
                    sh '''
                        git config user.email "jenkins@easycrm.local"
                        git config user.name "Jenkins CI"

                        # Ensure we are on the named branch (Jenkins checks out detached HEAD by default)
                        git checkout -B "${GIT_BRANCH}"

                        # Commit any tracked-file changes (e.g. Jenkinsfile updates, lockfile changes)
                        if [ -n "$(git status --porcelain)" ]; then
                            git add -A
                            git commit -m "ci: post-build update [skip ci]"
                        else
                            echo "No changes to commit — skipping commit step"
                        fi

                        git push "https://${GIT_USER}:${GIT_TOKEN}@github.com/lionel5116/easycrmlocal.git" \
                            "HEAD:${GIT_BRANCH}"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline finished successfully. App is live at http://localhost:8080"
        }
        failure {
            echo "Pipeline failed — check the stage logs above for details."
        }
        always {
            cleanWs()
        }
    }
}
