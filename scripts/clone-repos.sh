#!/bin/bash

# GitHub 저장소 클론 스크립트
USERNAME="choijinwon"
BASE_DIR="./github-repos"

# 저장소 목록
REPOS=(
  "promptedu"
  "vibe-coding-academy"
  "naver-blog-automation"
  "blog-hub"
  "shadcnui"
  "chapter-heard-01"
  "htmlCodeExample"
  "typescripblockchin"
  "graphql-ap"
  "vue-til-server"
  "vue-cli"
  "skinny-bones-jekyll"
  "todo-homeworks"
  "springboot-jpa"
  "learncoin"
  "altcryptomining"
  "ionic-site"
)

# 디렉토리 생성
mkdir -p "$BASE_DIR"

echo "Cloning ${#REPOS[@]} repositories to $BASE_DIR..."
echo ""

# 각 저장소 클론
for i in "${!REPOS[@]}"; do
  REPO="${REPOS[$i]}"
  REPO_URL="https://github.com/$USERNAME/$REPO.git"
  REPO_PATH="$BASE_DIR/$REPO"
  
  if [ -d "$REPO_PATH" ]; then
    echo "[$((i+1))/${#REPOS[@]}] $REPO already exists, skipping..."
  else
    echo "[$((i+1))/${#REPOS[@]}] Cloning $REPO..."
    git clone "$REPO_URL" "$REPO_PATH"
    if [ $? -eq 0 ]; then
      echo "✓ Successfully cloned $REPO"
    else
      echo "✗ Failed to clone $REPO"
    fi
  fi
  echo ""
done

echo "Done!"

