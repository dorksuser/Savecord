# Requirements Document

## Introduction

NOIR-Client is a lightweight Discord client modification that provides custom functionality through an injector and plugin system. The system enables users to enhance their Discord experience with features like custom Rich Presence integration for SoundCloud and a minimalist UI theme engine. The modification targets Discord Desktop (Stable/Canary) and uses Electron preload scripts with IPC communication.

## Glossary

- **NOIR_Client**: The complete Discord client modification system
- **Injector**: The Node.js script that modifies Discord's app.asar entry point
- **Plugin_System**: The modular architecture for loading and managing plugins
- **NoirPlugin**: The base interface that all plugins must implement
- **Core_Loader**: The preload script that initializes the plugin system
- **SoundCloud_RPC_Plugin**: A plugin that displays SoundCloud listening activity via Discord Rich Presence
- **UI_Engine**: The CSS injection system for applying custom themes
- **Nuclear_UI_Plugin**: A plugin that provides extreme interface optimization with media blocking and compression
- **Discord_Desktop**: The Electron-based Discord application (Stable or Canary channel)
- **app.asar**: Discord's packaged application archive file
- **Preload_Script**: An Electron script that runs before the renderer process loads
- **IPC**: Inter-Process Communication between Electron processes
- **Rich_Presence**: Discord's feature for displaying custom activity status

## Requirements

### Requirement 1: Discord Application Detection

**User Story:** As a user, I want the injector to automatically locate my Discord installation, so that I don't need to manually specify paths.

#### Acceptance Criteria

1. THE Injector SHALL detect Discord_Desktop installation paths on Windows, macOS, and Linux
2. WHEN multiple Discord versions are installed, THE Injector SHALL prompt the user to select a target version
3. THE Injector SHALL locate the app.asar file within the detected Discord installation
4. IF the app.asar file is not found, THEN THE Injector SHALL return a descriptive error message
5. THE Injector SHALL verify that the detected Discord installation is a valid Electron application

### Requirement 2: Application Entry Point Modification

**User Story:** As a user, I want the injector to modify Discord's entry point, so that custom code can be loaded at startup.

#### Acceptance Criteria

1. WHEN the Injector runs, THE Injector SHALL create a backup of the original app.asar entry point
2. THE Injector SHALL modify the Discord entry point to load the Core_Loader preload script
3. THE Injector SHALL preserve the original Discord functionality after modification
4. IF the entry point is already modified, THEN THE Injector SHALL detect this and skip modification
5. THE Injector SHALL validate that the modified entry point maintains valid JavaScript syntax

### Requirement 3: Plugin Interface Definition

**User Story:** As a plugin developer, I want a standardized plugin interface, so that I can create compatible plugins.

#### Acceptance Criteria

1. THE Plugin_System SHALL define a NoirPlugin interface with start and stop methods
2. THE NoirPlugin interface SHALL include metadata fields for name, version, and author
3. THE NoirPlugin interface SHALL support optional lifecycle hooks for initialization and cleanup
4. THE Plugin_System SHALL enforce that all plugins implement the NoirPlugin interface
5. THE Plugin_System SHALL provide type definitions for TypeScript plugin development

### Requirement 4: Plugin Discovery and Loading

**User Story:** As a user, I want plugins to be automatically discovered and loaded, so that I can easily add new functionality.

#### Acceptance Criteria

1. WHEN the Core_Loader initializes, THE Plugin_System SHALL scan a designated plugins directory
2. THE Plugin_System SHALL load all valid plugin files with .js or .ts extensions
3. THE Plugin_System SHALL instantiate each discovered plugin class
4. IF a plugin fails to load, THEN THE Plugin_System SHALL log the error and continue loading other plugins
5. THE Plugin_System SHALL maintain a registry of all loaded plugins with their metadata

### Requirement 5: Plugin Lifecycle Management

**User Story:** As a user, I want to enable or disable plugins without restarting Discord, so that I can manage functionality dynamically.

#### Acceptance Criteria

1. THE Plugin_System SHALL call the start method on each enabled plugin during initialization
2. WHEN a plugin is disabled, THE Plugin_System SHALL call the stop method on that plugin
3. THE Plugin_System SHALL persist plugin enable/disable state across Discord restarts
4. THE Plugin_System SHALL provide an API for plugins to register and unregister event handlers
5. WHEN Discord closes, THE Plugin_System SHALL call stop on all active plugins before shutdown

### Requirement 6: SoundCloud Activity Detection

**User Story:** As a user, I want my SoundCloud listening activity to be detected, so that it can be displayed on Discord.

#### Acceptance Criteria

1. THE SoundCloud_RPC_Plugin SHALL establish a WebSocket connection to a local server or browser extension
2. WHEN a SoundCloud track is playing, THE SoundCloud_RPC_Plugin SHALL receive track metadata including title and artist
3. THE SoundCloud_RPC_Plugin SHALL receive playback state updates including play, pause, and stop events
4. IF the WebSocket connection fails, THEN THE SoundCloud_RPC_Plugin SHALL attempt reconnection with exponential backoff
5. THE SoundCloud_RPC_Plugin SHALL validate received metadata before processing

### Requirement 7: Discord Rich Presence Integration

**User Story:** As a user, I want my SoundCloud activity displayed as Discord Rich Presence, so that others can see what I'm listening to.

#### Acceptance Criteria

1. WHEN a SoundCloud track is playing, THE SoundCloud_RPC_Plugin SHALL set Discord Rich Presence with track details
2. THE SoundCloud_RPC_Plugin SHALL populate the details field with the track name
3. THE SoundCloud_RPC_Plugin SHALL populate the state field with the artist name
4. THE SoundCloud_RPC_Plugin SHALL set the largeImageKey field to display the SoundCloud logo
5. WHERE a track URL is available, THE SoundCloud_RPC_Plugin SHALL add a button linking to the track
6. WHEN playback stops, THE SoundCloud_RPC_Plugin SHALL clear the Rich Presence activity

### Requirement 8: CSS Injection System

**User Story:** As a user, I want custom CSS applied to Discord, so that I can use a personalized theme.

#### Acceptance Criteria

1. THE UI_Engine SHALL inject custom CSS strings into the Discord document head element
2. THE UI_Engine SHALL apply CSS before the Discord interface renders
3. WHEN CSS is updated, THE UI_Engine SHALL replace the existing injected styles
4. THE UI_Engine SHALL support loading CSS from external files
5. IF CSS injection fails, THEN THE UI_Engine SHALL log the error without breaking Discord functionality

### Requirement 9: Minimalist Theme Implementation

**User Story:** As a user, I want a minimalist dark theme applied to Discord, so that I have a cleaner interface.

#### Acceptance Criteria

1. THE UI_Engine SHALL apply a color palette using #000000 for backgrounds
2. THE UI_Engine SHALL apply #1E3A8A for primary UI elements
3. THE UI_Engine SHALL apply #3B82F6 for accent colors and highlights
4. THE UI_Engine SHALL maintain Discord's layout structure while applying custom colors
5. THE UI_Engine SHALL ensure text remains readable with sufficient contrast ratios

### Requirement 10: Configuration Persistence

**User Story:** As a user, I want my settings saved, so that they persist across Discord restarts.

#### Acceptance Criteria

1. THE NOIR_Client SHALL store configuration in a JSON file in the user's application data directory
2. WHEN configuration changes, THE NOIR_Client SHALL write updates to the configuration file
3. WHEN the Core_Loader initializes, THE NOIR_Client SHALL load configuration from the file
4. IF the configuration file is corrupted, THEN THE NOIR_Client SHALL create a new file with default settings
5. THE NOIR_Client SHALL validate configuration data before applying settings

### Requirement 11: Error Handling and Logging

**User Story:** As a user, I want errors logged clearly, so that I can troubleshoot issues.

#### Acceptance Criteria

1. THE NOIR_Client SHALL log all errors to a dedicated log file
2. THE NOIR_Client SHALL include timestamps and severity levels in log entries
3. WHEN a critical error occurs, THE NOIR_Client SHALL display a user-friendly notification
4. THE NOIR_Client SHALL log plugin loading failures with specific error details
5. THE NOIR_Client SHALL implement log rotation to prevent excessive disk usage

### Requirement 12: Uninstallation and Restoration

**User Story:** As a user, I want to uninstall NOIR-Client cleanly, so that Discord returns to its original state.

#### Acceptance Criteria

1. THE Injector SHALL provide an uninstall command that restores the original app.asar entry point
2. WHEN uninstalling, THE Injector SHALL restore from the backup created during installation
3. THE Injector SHALL remove all NOIR_Client files except user configuration and logs
4. THE Injector SHALL verify that Discord launches successfully after uninstallation
5. IF no backup exists, THEN THE Injector SHALL prompt the user to reinstall Discord

### Requirement 13: Build System Configuration

**User Story:** As a developer, I want a fast build system, so that I can iterate quickly during development.

#### Acceptance Criteria

1. THE NOIR_Client SHALL use esbuild or swc for TypeScript compilation and bundling
2. THE NOIR_Client SHALL bundle the Core_Loader into a single JavaScript file
3. THE NOIR_Client SHALL bundle each plugin into a separate module
4. THE NOIR_Client SHALL generate source maps for debugging
5. THE NOIR_Client SHALL complete a full build in under 5 seconds on modern hardware

### Requirement 14: Development Mode Support

**User Story:** As a developer, I want a development mode, so that I can test changes without reinstalling.

#### Acceptance Criteria

1. WHERE development mode is enabled, THE Core_Loader SHALL watch for file changes
2. WHEN a plugin file changes, THE Plugin_System SHALL hot-reload that plugin
3. WHERE development mode is enabled, THE NOIR_Client SHALL enable verbose logging
4. THE NOIR_Client SHALL provide a toggle to switch between development and production modes
5. WHERE development mode is enabled, THE UI_Engine SHALL disable CSS caching

### Requirement 15: Nuclear UI Color Palette Enhancement

**User Story:** As a user, I want an extreme dark theme with true black backgrounds, so that I have maximum contrast and minimal eye strain.

#### Acceptance Criteria

1. THE Nuclear_UI_Plugin SHALL apply #000000 (true black) to all background surfaces including panels, chat area, and input fields
2. THE Nuclear_UI_Plugin SHALL apply #1E3A8A (deep blue) to all highlights and active icon states
3. THE Nuclear_UI_Plugin SHALL apply #2A2A2A (dark grey) for secondary UI elements and dividers
4. THE Nuclear_UI_Plugin SHALL override existing UI_Engine color values when Nuclear Mode is enabled
5. WHEN Nuclear Mode is disabled, THE Nuclear_UI_Plugin SHALL restore the default UI_Engine color palette

### Requirement 16: Extreme Interface Compression

**User Story:** As a user, I want a highly condensed interface, so that I can maximize content density and minimize wasted space.

#### Acceptance Criteria

1. THE Nuclear_UI_Plugin SHALL reduce all margin values to 2px or less throughout the interface
2. THE Nuclear_UI_Plugin SHALL apply a non-aliased monospace font family such as 'VT323' or equivalent to all text elements
3. THE Nuclear_UI_Plugin SHALL reduce font sizes by 20% compared to default Discord values
4. THE Nuclear_UI_Plugin SHALL reduce padding between UI elements to create tight spacing
5. THE Nuclear_UI_Plugin SHALL condense the server list into rigid square icons with minimal spacing

### Requirement 17: Media Killswitch Implementation

**User Story:** As a user, I want to block media from auto-loading, so that I can control bandwidth usage and reduce visual clutter.

#### Acceptance Criteria

1. THE Nuclear_UI_Plugin SHALL use Webpack module searching to locate ImageResolver and EmbedRender modules
2. WHEN an image, GIF, or video would render, THE Nuclear_UI_Plugin SHALL intercept the rendering flow
3. THE Nuclear_UI_Plugin SHALL render a solid grey placeholder (#2A2A2A) with the text "Media Killswitch Active - Click to View"
4. THE Nuclear_UI_Plugin SHALL include a clickable eye icon on each placeholder
5. WHEN a user clicks the eye icon or placeholder, THE Nuclear_UI_Plugin SHALL reveal the actual media content for that specific item
6. THE Nuclear_UI_Plugin SHALL maintain media reveal state per message to avoid re-blocking revealed content

### Requirement 18: DOM Purge and Styling Overrides

**User Story:** As a user, I want unnecessary UI elements removed and all rounded corners eliminated, so that I have a minimal, rigid interface.

#### Acceptance Criteria

1. THE Nuclear_UI_Plugin SHALL inject CSS to hide "Gift Nitro", "Stickers", and "Explore" buttons
2. THE Nuclear_UI_Plugin SHALL set border-radius to 0 globally to remove all rounded corners
3. THE Nuclear_UI_Plugin SHALL disable backdrop-filter properties globally to remove transparency blur effects
4. THE Nuclear_UI_Plugin SHALL hide status indicator dots from the user list via CSS injection
5. THE Nuclear_UI_Plugin SHALL apply rigid square styling to all server icons

### Requirement 19: Custom Nuclear Header Component

**User Story:** As a user, I want a custom minimal header with Nuclear Mode controls, so that I can easily toggle the feature and see branding.

#### Acceptance Criteria

1. THE Nuclear_UI_Plugin SHALL render a custom top-bar component that replaces the standard Discord header
2. THE Nuclear_UI_Plugin SHALL display "NOIR-Client" branding text on the left side of the header
3. THE Nuclear_UI_Plugin SHALL display a functional toggle switch labeled "Nuclear Mode: ON" on the right side of the header
4. WHEN the toggle switch is clicked, THE Nuclear_UI_Plugin SHALL enable or disable Nuclear Mode styling
5. THE Nuclear_UI_Plugin SHALL persist the Nuclear Mode state using the NOIR_Client configuration system

### Requirement 20: Webpack Module Patching System

**User Story:** As a plugin developer, I want a Webpack module patching utility, so that I can intercept and modify Discord's internal modules.

#### Acceptance Criteria

1. THE Nuclear_UI_Plugin SHALL implement a Webpack module search function that iterates through loaded modules
2. THE Nuclear_UI_Plugin SHALL locate modules by searching for specific property names or method signatures
3. WHEN a target module is found, THE Nuclear_UI_Plugin SHALL apply monkey-patching to intercept method calls
4. THE Nuclear_UI_Plugin SHALL preserve original module functionality while adding interception logic
5. IF a target module cannot be found, THEN THE Nuclear_UI_Plugin SHALL log a warning and gracefully degrade functionality
6. THE Nuclear_UI_Plugin SHALL focus patching efforts on ImageResolver and EmbedRender modules for media blocking
