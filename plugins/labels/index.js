/**
 * A plugin to identify unlabeled inputs
 */

var $ = require("jquery");
var Plugin = require("../base");
var annotate = require("../shared/annotate")("labels");

require("./style.less");

const HIGHLIGHT_CLASS = "tota11y-label-highlight";
const WRAPPING_CLASS = "tota11y-label-wrapped";

class LabelsPlugin extends Plugin {
    getTitle() {
        return "Labels"
    }

    getDescription() {
        return "Identifies inputs with missing labels"
    }

    // Tests if a given nullable string has any content that can be read by
    // a screen reader
    isReadable(text) {
        return /\w/.test(text || "");
    }

    // Test for inputs that require a label
    // Specifically, test for the existence and usefulness of any of the
    // following:
    //   - a label whose `for` attribute matches the input's `id`
    //   - a label wrapping the input
    //   - an `aria-label` attribute
    //   - an element whose `id` matches the input's `aria-labelledby`
    hasValidLabel($el) {
        // Check for a label tag whose `for` matches the `id` of the input
        let id = $el.prop("id");
        if (id && $(`label[for="${id}"]`).text()) {
            return true;
        }

        // Check if the input is wrapped in a label
        if (this.isReadable($el.closest("label").text())) {
            return true;
        }

        // Check for an `aria-label` attribute
        if (this.isReadable($el.prop("aria-label"))) {
            return true;
        }

        // Check for an element whose `id` matches the input's
        // `aria-labelledby` value
        let labelledBy = $el.prop("aria-labelledby");
        let $label = $("#" + labelledBy);
        if ($label && this.isReadable($label.text())) {
            return true;
        }

        // TODO: aria-describedby?

        return false;
    }

    run() {
        const assert = ($el, condition, message) => {
            if (!condition) {
                // Wrap the element in a span so we can show a tooltip on
                // hover. We will need to undo this in `cleanup()`
                $el.addClass(WRAPPING_CLASS).wrap(
                    $("<span>").addClass("tota11y-tooltipped")
                               .attr("data-content", message));

                annotate.highlight($el).addClass(HIGHLIGHT_CLASS);
            }
        }

        const $inputs = $("button, input, select, textarea");

        $inputs.each((i, el) => {
            const $el = $(el);

            // Ignore inputs inside of tota11y itself
            if ($el.parents(".tota11y-toolbar").length > 0) {
                return;
            }

            // Ignore disabled inputs and inputs with `type="hidden"`
            if ($el.is("[disabled], [type='hidden']")) {
                return;
            }

            // Submit and reset inputs provide their own labeling
            if ($el.is("[type='submit'], [type='reset']")) {
                return;
            }

            if ($el.is("button")) {
                return assert($el, this.isReadable($el.text()),
                    "This button does not contain any inner text");
            }

            if ($el.is("[type='image']")) {
                return assert($el, this.isReadable($el.attr("alt")),
                    "Image inputs must have non-empty alt-text associated " +
                    "with them");
            }

            // This element requires a valid label
            return assert($el, this.hasValidLabel($el),
                "This input does not have a valid label associated with it");
        });
    }

    cleanup() {
        annotate.removeAll();

        // Unwrap any wrapped items
        $("." + WRAPPING_CLASS).removeClass(WRAPPING_CLASS).unwrap();
    }
}

module.exports = LabelsPlugin;
