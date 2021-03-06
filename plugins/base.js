/**
 * Base class for plugins.
 *
 * This module defines methods to render and mount plugins to the toolbar.
 * Each plugin will define four methods:
 *     getTitle: title to display in the toolbar
 *     getDescription: description to display in the toolbar
 *     run: code to run when the plugin is activated from the toolbar
 *     cleanup: code to run when the plugin is deactivated from the toolbar
 */

let $ = require("jquery");
let template = require("../templates/plugin.handlebars");
let id = 1;

class Plugin {
    constructor() {
        this.id = id++;
    }

    getTitle() {
        return "New plugin";
    }

    getDescription() {
        return "";
    }

    /**
     * Renders the plugin view.
     */
    render() {
        let templateData = {
            title: this.getTitle(),
            description: this.getDescription()
        };

        return $(template(templateData));
    }

    /**
     * Attaches the plugin to a given DOMNode.
     * (chainable)
     */
    appendTo($el) {
        // Render and mount plugin
        let $plugin = this.render();
        $el.append($plugin);

        let $checkbox = $plugin.find(".tota11y-plugin-checkbox");

        // Trigger a `plugin-switched` event on the container, which will be
        // dispatched to all plugins. We include this plugin's ID to determine
        // if we should enable or disable the plugin listening for this event.
        $checkbox.click(() => {
            $el.trigger("plugin-switched", [this.id]);
        });

        // Listen for the `plugin-switched` event on the plugins container.
        $el.on("plugin-switched", (e, id) => {
            // If we are the plugin that the user has interacted with: we
            // follow the traditional pattern of running if checked, and
            // cleaning up if not.
            if (id === this.id) {
                if ($checkbox.is(":checked")) {
                    this.run();
                } else {
                    this.cleanup();
                }
            // If we are an active plugin that the user switched from, we
            // uncheck ourselves and clean up.
            } else if ($checkbox.is(":checked")) {
                $checkbox.attr("checked", false);
                this.cleanup();
            }
        });

        return this;
    }
}

module.exports = Plugin;
