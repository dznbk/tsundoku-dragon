#!/bin/bash
# This is sample script, and you should verify your own.
# SessionStart hook: GitHub CLI auto-installation for remote environments
# This script installs gh CLI when running in Claude Code on the Web
# following best practices: idempotent, fail-safe, proper logging

set -e

LOG_PREFIX="[gh-setup]"

log() {
    echo "$LOG_PREFIX $1" >&2
}

# Only run in remote Claude Code environment
if [ "$CLAUDE_CODE_REMOTE" != "true" ]; then
    log "Not a remote session, skipping gh setup"
    exit 0
fi

log "Remote session detected, checking gh CLI..."

# Check if gh is already available
if command -v gh &>/dev/null; then
    log "gh CLI already available: $(gh --version | head -1)"
    exit 0
fi

# Setup local bin directory
LOCAL_BIN="$HOME/.local/bin"
mkdir -p "$LOCAL_BIN"

# Check if gh exists in local bin
if [ -x "$LOCAL_BIN/gh" ]; then
    log "gh found in $LOCAL_BIN"
    # Ensure PATH includes local bin
    if [[ ":$PATH:" != *":$LOCAL_BIN:"* ]]; then
        export PATH="$LOCAL_BIN:$PATH"
        # Persist to CLAUDE_ENV_FILE if available
        if [ -n "$CLAUDE_ENV_FILE" ]; then
            echo "export PATH=\"$LOCAL_BIN:\$PATH\"" >> "$CLAUDE_ENV_FILE"
            log "PATH updated in CLAUDE_ENV_FILE"
        fi
    fi
    exit 0
fi

log "Installing gh CLI..."

# Method 1: Try apt-get (works in Claude Code on the Web environment)
install_via_apt() {
    log "Trying apt-get installation..."
    if command -v apt-get &>/dev/null; then
        # Check if we can run apt-get (with or without sudo)
        if [ "$(id -u)" = "0" ]; then
            # Running as root
            if apt-get update -qq 2>/dev/null && apt-get install -y -qq gh 2>/dev/null; then
                log "gh CLI installed via apt-get"
                return 0
            fi
        elif command -v sudo &>/dev/null; then
            # Try with sudo
            if sudo apt-get update -qq 2>/dev/null && sudo apt-get install -y -qq gh 2>/dev/null; then
                log "gh CLI installed via sudo apt-get"
                return 0
            fi
        fi
    fi
    return 1
}

# Method 2: Download from GitHub releases (may not work due to proxy restrictions)
install_via_download() {
    log "Trying direct download from GitHub..."

    # Create temp directory for installation
    TEMP_DIR=$(mktemp -d)
    trap "rm -rf $TEMP_DIR" EXIT

    # Detect architecture
    ARCH=$(uname -m)
    case "$ARCH" in
        x86_64)
            GH_ARCH="amd64"
            ;;
        aarch64|arm64)
            GH_ARCH="arm64"
            ;;
        *)
            log "Unsupported architecture: $ARCH"
            return 1
            ;;
    esac

    # Download and install gh CLI
    GH_VERSION="2.62.0"
    GH_TARBALL="gh_${GH_VERSION}_linux_${GH_ARCH}.tar.gz"
    GH_URL="https://github.com/cli/cli/releases/download/v${GH_VERSION}/${GH_TARBALL}"

    log "Downloading gh v${GH_VERSION} for ${GH_ARCH}..."
    log "URL: $GH_URL"

    # Use -f to fail on HTTP errors, -S to show errors even with -s
    # Add User-Agent header to avoid 403 from GitHub
    CURL_OPTS=(-fsSL -A "gh-setup-script/1.0" --connect-timeout 30 --retry 2)

    if ! curl "${CURL_OPTS[@]}" "$GH_URL" -o "$TEMP_DIR/$GH_TARBALL" 2>&1; then
        CURL_EXIT_CODE=$?
        log "curl failed with exit code: $CURL_EXIT_CODE"

        # Try wget as fallback
        log "Trying wget as fallback..."
        if command -v wget &>/dev/null; then
            if ! wget -q --user-agent="gh-setup-script/1.0" -O "$TEMP_DIR/$GH_TARBALL" "$GH_URL" 2>&1; then
                log "wget also failed"
                return 1
            fi
            log "wget download succeeded"
        else
            log "wget not available, download failed"
            return 1
        fi
    fi

    log "Extracting..."
    if ! tar -xzf "$TEMP_DIR/$GH_TARBALL" -C "$TEMP_DIR"; then
        log "Failed to extract gh CLI"
        return 1
    fi

    # Move binary to local bin
    if ! mv "$TEMP_DIR/gh_${GH_VERSION}_linux_${GH_ARCH}/bin/gh" "$LOCAL_BIN/gh"; then
        log "Failed to install gh CLI"
        return 1
    fi

    chmod +x "$LOCAL_BIN/gh"

    # Update PATH
    export PATH="$LOCAL_BIN:$PATH"

    # Persist PATH to CLAUDE_ENV_FILE if available
    if [ -n "$CLAUDE_ENV_FILE" ]; then
        echo "export PATH=\"$LOCAL_BIN:\$PATH\"" >> "$CLAUDE_ENV_FILE"
        log "PATH persisted to CLAUDE_ENV_FILE"
    fi

    log "gh CLI installed successfully to $LOCAL_BIN"
    return 0
}

# Try installation methods in order
if install_via_apt; then
    log "gh CLI ready: $(gh --version | head -1)"
    exit 0
fi

if install_via_download; then
    log "gh CLI ready: $($LOCAL_BIN/gh --version | head -1)"
    exit 0
fi

# All methods failed
log "Could not install gh CLI (all methods failed)"
log "Note: In Claude Code on the Web, github.com may be blocked by proxy."
log "Consider using apt-get or pre-installing gh in your environment."
exit 0  # Fail-safe: always exit 0 to not block the hook
