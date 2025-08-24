#!/bin/bash

# BMAD Method v3.0 - Tool Installation Script
# Installs missing VS Code extensions and NPM packages

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║         🔧 BMAD METHOD - TOOL INSTALLATION SCRIPT 🔧            ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Check if VS Code is installed
if ! command -v code &> /dev/null; then
    echo "❌ VS Code CLI not found. Please install VS Code first."
    exit 1
fi

echo "📦 Installing VS Code Extensions..."
echo "═══════════════════════════════════════"

# Essential extensions for BMAD Method
extensions=(
    "mechatroner.rainbow-csv"           # CSV viewer
    "alefragnani.Bookmarks"              # Bookmarks
    "anseki.vscode-color"                # Color picker
    "ritwickdey.LiveServer"              # Live server
    "ryanluker.vscode-coverage-gutters"  # Coverage display
    "hbenl.vscode-test-explorer"         # Test explorer
    "Gruntfuggly.todo-tree"              # TODO tree
    "yzhang.markdown-all-in-one"         # Markdown editor
    "jebbs.plantuml"                     # PlantUML diagrams
    "hediet.vscode-drawio"               # Diagrams
    "adamhartford.vscode-base64"         # Base64 encode/decode
    "quicktype.quicktype"                # JSON to types
    "zxh404.vscode-proto3"               # Protocol buffers
)

installed=0
skipped=0
failed=0

for ext in "${extensions[@]}"; do
    echo -n "Installing $ext... "
    if code --list-extensions 2>/dev/null | grep -q "^$ext$"; then
        echo "✓ Already installed"
        ((skipped++))
    else
        if code --install-extension "$ext" &>/dev/null; then
            echo "✅ Installed"
            ((installed++))
        else
            echo "❌ Failed"
            ((failed++))
        fi
    fi
done

echo ""
echo "📦 Installing NPM Packages..."
echo "═══════════════════════════════════════"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ NPM not found. Please install Node.js first."
else
    # Global NPM packages for BMAD
    packages=(
        "@playwright/test"      # Testing framework
        "typescript"            # TypeScript
        "tsx"                   # TypeScript executor
        "eslint"                # Linting
        "prettier"              # Code formatting
    )
    
    for pkg in "${packages[@]}"; do
        echo -n "Installing $pkg... "
        if npm list -g "$pkg" &>/dev/null; then
            echo "✓ Already installed"
        else
            if npm install -g "$pkg" &>/dev/null; then
                echo "✅ Installed"
            else
                echo "❌ Failed (may need sudo)"
            fi
        fi
    done
fi

echo ""
echo "📦 Checking Optional Tools..."
echo "═══════════════════════════════════════"

# Check for optional but recommended tools
optional_tools=(
    "docker:Docker"
    "git:Git"
    "python3:Python 3"
    "pip3:Pip 3"
    "cargo:Rust/Cargo"
)

for tool_info in "${optional_tools[@]}"; do
    IFS=':' read -r cmd name <<< "$tool_info"
    if command -v "$cmd" &> /dev/null; then
        echo "✅ $name is installed"
    else
        echo "⚠️  $name is not installed (optional)"
    fi
done

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "                    📊 INSTALLATION SUMMARY"
echo "═══════════════════════════════════════════════════════════════════"
echo "  VS Code Extensions:"
echo "    ✅ Installed: $installed"
echo "    ⏭️  Skipped: $skipped"
echo "    ❌ Failed: $failed"
echo ""
echo "✨ Tool installation complete!"
echo ""
echo "Next steps:"
echo "  1. Restart VS Code to activate new extensions"
echo "  2. Run 'npm run bmad:activate' to verify BMAD system"
echo "  3. Use 'npm run bmad' to start using BMAD Method"
echo ""