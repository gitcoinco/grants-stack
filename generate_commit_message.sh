#!/bin/bash

echo -e "\033[1mAllo release script\033[0m\n"

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo -e "\n\033[31mError: Uncommitted changes, release aborted\033[0m"
  exit 1
fi

# Switch to the main branch
git checkout main

# Update main branch from origin
git pull origin main

# Find the commit hash of the latest merge of main into release
LAST_RELEASE_COMMIT=$(git merge-base main release)

# Print the commit hash
echo "Latest merge commit hash: $LAST_RELEASE_COMMIT"

# Prompt the user to confirm the commit hash
read -p "Is the commit hash $LAST_RELEASE_COMMIT okay? (y/n) " CONFIRM

# Check if the user confirmed
if [ "$CONFIRM" == "y" ]; then
  echo "Proceeding with commit hash $LAST_RELEASE_COMMIT..."
else
  echo "Aborting."
  exit 1
fi

COMMIT_MESSAGE=""
REPO_URL="https://github.com/gitcoinco/grants-round"

# Get a list of commits since the last release
COMMITS=$(git log --pretty=format:"%h - %s - %an" $LAST_RELEASE_COMMIT..HEAD)

# Iterate through the list of commits and extract the commit message, author, and hash
while read -r commit; do
  HASH=$(echo $commit | awk '{print $1}')
  MESSAGE=$(echo $commit | awk '{$1=""; print}')
  COMMIT_MESSAGE="$COMMIT_MESSAGE * [$HASH]($REPO_URL/commit/$HASH)$MESSAGE \n"
done <<<"$COMMITS"

echo -e "$COMMIT_MESSAGE"

# Prompt the user to confirm the commit message
read -p "Is the commit message okay? (y/n) " CONFIRM

# Check if the user confirmed
if [ "$CONFIRM" == "y" ]; then
  echo "Copying to clipboard"
else
  echo "Aborting."
  exit 1
fi

echo "$COMMIT_MESSAGE" | pbcopy
