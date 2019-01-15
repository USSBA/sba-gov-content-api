#!/bin/bash
DEVELOPER_OR_ENVIRONMENT=$1
ENVIRONMENT_NAME=$DEVELOPER_OR_ENVIRONMENT

if [ $DEVELOPER_OR_ENVIRONMENT == "avery" ]; then
  ENVIRONMENT_NAME="int-as"
elif [ $DEVELOPER_OR_ENVIRONMENT == "brian"  ]; then
  ENVIRONMENT_NAME="int-bl"
elif [ $DEVELOPER_OR_ENVIRONMENT == "kevin"  ]; then
  ENVIRONMENT_NAME="int-kl"
elif [ $DEVELOPER_OR_ENVIRONMENT == "ryan"  ]; then
  ENVIRONMENT_NAME="int-rh"
fi

echo "Pushing to ${ENVIRONMENT_NAME}"

git tag ${ENVIRONMENT_NAME} -f && git push origin ${ENVIRONMENT_NAME} -f