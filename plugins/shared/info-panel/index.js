/**
 * The following code defines an information panel that can be invoked from
 * any plugin to display summaries, errors, or more information about what
 * the plugin is doing.
 *
 * These panels are moveable and closeable, and are unique to the plugin that
 * created them. They appear in the bottom right corner of the viewport.
 *
 * Info panels consist of a title and three optional sections, which form
 * tabs that users can switch between.
 *
 *   Summary: A summary of the plugin's results
 *   Errors: A list of violations reported by this plugin. The tab marker also
 *           contains the number of errors listed
 */

let $ = require("jquery");
let annotate = require("../annotate")("info-panel");

let template = require("./template.handlebars");
let errorTemplate = require("./error.handlebars");
let tabTemplate = require("./tab.handlebars");
require("./style.less");

class InfoPanel {
    constructor(title="Plugin") {
        this.title = title;
        this.about = null;
        this.summary = null;
        this.errors = [];

        this.$el = null;
    }

    /**
     * Sets the title of the info panel
     * (chainable)
     */
    setTitle(title) {
        this.title = title;
        return this;
    }

    /**
     * Sets the contents of the about section as HTML
     * (chainable)
     */
    setAbout(about) {
        this.about = about;
        return this;
    }

    /**
     * Sets the contents of the summary section as HTML
     * (chainable)
     */
    setSummary(summary) {
        this.summary = summary;
        return this;
    }

    /**
     * Adds an error to the errors tab. Also receives a jQuery element to
     * highlight on hover.
     * (chainable)
     */
    addError(title, description, $el) {
        this.errors.push({title, description, $el});
        return this;
    }

    render() {
        this.$el = $(template({
            title: this.title,
        }));

        let addTab = (title, html) => {
            // Create and append a tab marker
            let $tab = $(tabTemplate({title}));
            this.$el.find(".tota11y-info-tabs").append($tab);

            // Create and append the tab content
            let $section = $("<div>")
                .addClass("tota11y-info-section")
                .html(html);
            this.$el.find(".tota11y-info-sections").append($section);

            // Register an "activate" event for the tab, which switches the
            // tab's associated content to be visible, and changes the
            // appearance of the newly-active tab marker
            $tab.on("activate", () => {
                this.$el.find(".tota11y-info-tab.active")
                    .removeClass("active");
                this.$el.find(".tota11y-info-section.active")
                    .removeClass("active");

                $tab.addClass("active");
                $section.addClass("active");
            });

            // Activate the tab when its anchor is clicked
            $tab.on("click", (e) => {
                e.preventDefault();
                $tab.trigger("activate");
            });

            return $tab;
        };

        // Add the appropriate tabs based on which information the info panel
        // was provided, then highlight the most important one.
        let $activeTab;
        if (this.about) {
            $activeTab = addTab("About", this.about);
        }

        if (this.summary) {
            $activeTab = addTab("Summary", this.summary);
        }

        // TODO: Add errors and attach events
        if (this.errors.length > 0) {
            let $errors = $("<ul>").addClass("tota11y-info-errors");

            this.errors.forEach((error) => {
                let $error = $(errorTemplate(error));
                $errors.append($error);

                // Highlight the violating element on hover
                annotate.toggleHighlight(error.$el, $error);
            });

            $activeTab = addTab("Errors", $errors);

            // Add a small badge next to the tab title
            let $badge = $("<div>")
                .addClass("tota11y-info-error-count")
                .text(this.errors.length);

            $activeTab.find(".tota11y-info-tab-anchor").append($badge);
        }

        if ($activeTab) {
            $activeTab.trigger("activate");
        }

        // Wire up the dismiss button
        this.$el.find(".tota11y-info-dismiss-trigger").click((e) => {
            e.preventDefault();
            this.destroy();
        });

        // Append the info panel to the body. In reality we'll likely want it
        // directly adjacent to the toolbar.
        $("body").append(this.$el);
        return this.$el;
    }

    destroy() {
        this.$el.remove();
    }
}

module.exports = InfoPanel;
