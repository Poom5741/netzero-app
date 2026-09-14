#!/bin/bash
# Spec-Driven Workflow Setup Script
# Run this once to install all dependencies
# Usage: ./scripts/setup-spec-driven.sh

set -e

echo "=== Spec-Driven Workflow Setup ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ $2${NC}"
  else
    echo -e "${RED}❌ $2${NC}"
  fi
}

echo "Step 1: Checking prerequisites..."
echo ""

# Check uv
if command_exists uv; then
  print_status 0 "uv installed ($(uv --version | head -1))"
else
  print_status 1 "uv not found"
  echo "  Installing uv..."
  pip3 install uv 2>&1 | tail -3
  if command_exists uv; then
    print_status 0 "uv installed successfully"
  else
    print_status 1 "Failed to install uv"
    echo "  Please install manually: pip3 install uv"
  fi
fi

# Check specify
if command_exists specify; then
  print_status 0 "specify CLI installed ($(specify --version))"
else
  print_status 1 "specify CLI not found"
  echo "  Installing GitHub Spec Kit..."
  
  # Clone and install
  cd /tmp
  if [ -d "spec-kit" ]; then
    rm -rf spec-kit
  fi
  
  git clone https://github.com/github/spec-kit.git 2>&1 | tail -3
  cd spec-kit
  uv tool install specify-cli --from . 2>&1 | tail -5
  
  cd ~
  rm -rf /tmp/spec-kit
  
  if command_exists specify; then
    print_status 0 "specify CLI installed successfully"
  else
    print_status 1 "Failed to install specify CLI"
    echo "  Please install manually:"
    echo "    cd /tmp && git clone https://github.com/github/spec-kit.git"
    echo "    cd spec-kit && uv tool install specify-cli --from ."
  fi
fi

# Check node
if command_exists node; then
  print_status 0 "Node.js installed ($(node --version))"
else
  print_status 1 "Node.js not found"
  echo "  Please install Node.js: https://nodejs.org/"
fi

echo ""
echo "Step 2: Checking project dependencies..."
echo ""

# Check if we're in a project directory
if [ -f "package.json" ]; then
  print_status 0 "Found package.json"
  
  # Check pixelmatch
  if npm list pixelmatch >/dev/null 2>&1; then
    print_status 0 "pixelmatch installed"
  else
    print_status 1 "pixelmatch not found"
    echo "  Installing visual test dependencies..."
    npm install -D pixelmatch canvas 2>&1 | tail -5
    if npm list pixelmatch >/dev/null 2>&1; then
      print_status 0 "Dependencies installed successfully"
    else
      print_status 1 "Failed to install dependencies"
      echo "  Please install manually: npm install -D pixelmatch canvas"
    fi
  fi
else
  print_status 1 "Not in a Node.js project directory"
  echo "  Run this script from your project root (where package.json is)"
fi

echo ""
echo "Step 3: Checking ZCode skills..."
echo ""

# Check skills
SKILLS_DIR="$HOME/.zcode/skills"

if [ -d "$SKILLS_DIR" ]; then
  print_status 0 "ZCode skills directory exists"
  
  # Check spec-driven-workflow
  if [ -f "$SKILLS_DIR/spec-driven-workflow/SKILL.md" ]; then
    print_status 0 "spec-driven-workflow skill installed"
  else
    print_status 1 "spec-driven-workflow skill not found"
    echo "  This skill should be at: $SKILLS_DIR/spec-driven-workflow/SKILL.md"
  fi
  
  # Check github-spec-kit
  if [ -f "$SKILLS_DIR/github-spec-kit/SKILL.md" ]; then
    print_status 0 "github-spec-kit skill installed"
  else
    print_status 1 "github-spec-kit skill not found"
    echo "  Install via ZCode: /github-spec-kit"
  fi
  
  # Check visual-qa
  if [ -f "$SKILLS_DIR/visual-qa/SKILL.md" ]; then
    print_status 0 "visual-qa skill installed"
  else
    print_status 1 "visual-qa skill not found"
    echo "  Install via ZCode: /visual-qa"
  fi
else
  print_status 1 "ZCode skills directory not found"
  echo "  Please install ZCode first: https://zcode.dev"
fi

echo ""
echo "Step 4: Checking project structure..."
echo ""

# Check for specs directory
if [ -d "specs" ]; then
  print_status 0 "specs/ directory exists"
  
  # Count specs
  SPEC_COUNT=$(find specs -name "spec.md" -type f | wc -l | tr -d ' ')
  if [ "$SPEC_COUNT" -gt 0 ]; then
    print_status 0 "Found $SPEC_COUNT spec file(s)"
  else
    print_status 1 "No spec files found"
    echo "  Create your first spec: specs/<feature>/spec.md"
  fi
else
  print_status 1 "specs/ directory not found"
  echo "  Create it: mkdir -p specs"
fi

# Check for scripts
if [ -f "scripts/check-spec-compliance.sh" ]; then
  print_status 0 "check-spec-compliance.sh exists"
else
  print_status 1 "check-spec-compliance.sh not found"
  echo "  This script should be in your project"
fi

if [ -f "scripts/what-next.sh" ]; then
  print_status 0 "what-next.sh exists"
else
  print_status 1 "what-next.sh not found"
  echo "  This script should be in your project"
fi

# Check for visual tests
if [ -d "tests/visual" ]; then
  print_status 0 "tests/visual/ directory exists"
else
  print_status 1 "tests/visual/ directory not found"
  echo "  Create it: mkdir -p tests/visual"
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Run: ./scripts/what-next.sh"
echo "  2. Initialize GitHub Spec Kit: specify init . --integration copilot"
echo "  3. Create your first spec: specs/<feature>/spec.md"
echo ""
echo "For help, read: ~/.zcode/skills/spec-driven-workflow/SKILL.md"
echo ""
