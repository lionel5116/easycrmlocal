#!/usr/bin/env bash
# Usage: ./create-job.sh <jenkins-username> <jenkins-password>
# Example: ./create-job.sh admin mypassword
#
# Creates the easycrm-pipeline Pipeline job in Jenkins.
# Run this once after completing the Jenkins setup wizard.

set -euo pipefail

JENKINS_URL="http://127.0.0.1:8081"
JAVA="/opt/homebrew/opt/openjdk@21/bin/java"
CLI_JAR="/tmp/jenkins-cli.jar"
JOB_NAME="easycrm-pipeline"
JOB_XML="$(dirname "$0")/job-config.xml"

if [ $# -lt 2 ]; then
  echo "Usage: $0 <username> <password>"
  exit 1
fi

USER="$1"
PASS="$2"

# Download fresh CLI jar if missing
if [ ! -f "${CLI_JAR}" ]; then
  echo "Downloading Jenkins CLI jar..."
  curl -s -u "${USER}:${PASS}" -o "${CLI_JAR}" "${JENKINS_URL}/jnlpJars/jenkins-cli.jar"
fi

echo "Creating job '${JOB_NAME}'..."
$JAVA -jar "${CLI_JAR}" \
  -s "${JENKINS_URL}" \
  -auth "${USER}:${PASS}" \
  create-job "${JOB_NAME}" < "${JOB_XML}"

echo "Done. Job created: ${JENKINS_URL}/job/${JOB_NAME}/"
echo ""
echo "Next steps:"
echo "  1. Add a GitHub credential in Jenkins:"
echo "     ${JENKINS_URL}/credentials/store/system/domain/_/newCredentials"
echo "     Kind: Username with password"
echo "     ID:   github-credentials"
echo "     Username: your GitHub username"
echo "     Password: your GitHub Personal Access Token"
echo ""
echo "  2. Push Jenkinsfile to GitHub:"
echo "     git add Jenkinsfile && git commit -m 'ci: add Jenkinsfile' && git push"
echo ""
echo "  3. Trigger a build:"
echo "     ${JENKINS_URL}/job/${JOB_NAME}/build"
