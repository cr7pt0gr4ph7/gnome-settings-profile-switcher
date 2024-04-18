// SPDX-License-Identifier: GPL-2.0-or-later
/*
// GNOME >= 45 uses ESModules
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as QuickSettings from 'resource:///org/gnome/shell/ui/quickSettings.js';
*/

// GNOME <= 44 uses a custom import system
const { Gio, GObject } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const QuickSettings = imports.ui.quickSettings;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const ProfileSwitcherIndicator = GObject.registerClass(
    class ProfileSwitcherIndicator extends QuickSettings.SystemIndicator {
        _init(extensionObject) {
            super._init();

            // Create an icon for the indicator
            this._indicator = this._addIndicator();
            this._indicator.icon_name = 'selection-mode-symbolic';

            // Showing an indicator when the feature is enabled
            // GNOME 45+
            // this._settings = extensionObject.getSettings();
            // GNOME 44
            this._settings = ExtensionUtils.getSettings();
            this._settings.bind('feature-enabled',
                this._indicator, 'visible',
                Gio.SettingsBindFlags.DEFAULT);
        }
    });

const ExampleToggle = GObject.registerClass(
    class ExampleToggle extends QuickSettings.QuickToggle {
        _init(extensionObject) {
            super._init({
                title: _('Example Title'),
                subtitle: _('Example Subtitle'),
                iconName: 'selection-mode-symbolic',
                toggleMode: true,
            });

            // Binding the toggle to a GSettings key
            // GNOME 45+
            // this._settings = extensionObject.getSettings();
            // GNOME 44
            this._settings = ExtensionUtils.getSettings();
            this._settings.bind('feature-enabled',
                this, 'checked',
                Gio.SettingsBindFlags.DEFAULT);
        }
    });

// This is a bit of a hack, but it works for now. Originally taken from
// the gjs guide on how to position items above the background apps menu.
// This version was taken from:
// https://github.com/qwreey/quick-settings-tweaks/blob/gnome44-legacy/libs/utility.js
function addQuickSettingsItems(items) {
    const QuickSettings = Main.panel.statusArea.quickSettings;
    const QuickSettingsGrid = QuickSettings.menu._grid;

    // Add the items with the built-in function
    QuickSettings._addItems(items)

    // Ensure the tile(s) are above the background apps menu
    if (QuickSettings._backgroundApps) {
        for (const item of items) {
            QuickSettingsGrid.set_child_below_sibling(
                item,
                QuickSettings._backgroundApps.quickSettingsItems[0]
            )
        }
    }
}

class TunedProfileSwitcher {
    constructor() {
    }

    enable() {
        this._indicator = new ProfileSwitcherIndicator(this);
        this._indicator.quickSettingsItems.push(new ExampleToggle(this));

        // GNOME 45
        // Main.panel.statusArea.quickSettings.menu._indicators.add_child(this);
        addQuickSettingsItems(this._indicator.quickSettingsItems);

        // GNOME 45+
        // Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);
    }

    disable() {
        this._indicator.quickSettingsItems.forEach(item => item.destroy());
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init() {
    return new TunedProfileSwitcher();
}
