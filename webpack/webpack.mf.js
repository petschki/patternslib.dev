const { ModuleFederationPlugin } = require("webpack").container;

// Patternslib Module Federation bundle prefix.
// This is used to filter for module federation enabled bundles.
// NOTE: This is also defined in ``module_federation.js``.
const MF_NAME_PREFIX = "__patternslib_mf__";

/**
 * Get dependencies and versions for the module federation plugin from
 * package.json dependency lists.
 *
 * @param {Array} - List of package.json dependencies fields.
 * @returns {Object} - Object with dependencies for the module federation plugin.
 */
function shared_from_dependencies(...dependencies) {
    const shared = {};
    for (const deps of dependencies) {
        if (!deps) {
            continue;
        }
        for (const [name, version] of Object.entries(deps)) {
            shared[name] = {
                singleton: true,
                requiredVersion: version,
            };
        }
    }
    return shared;
}

/**
 * Webpack module federation config factory.
 *
 * Use this to extend your webpack configuration for module federation support.
 *
 * @param {String} name - Bundle/remote name. If not given, the package.json name is used.
 * @param {String} remote_entry - Path to which the new remote entry file is written to.
 * @param {String} filename - Name of the generated remote entry file. Default ``remote.min.js``.
 * @param {Object} dependencies - Object with dependency name - version specifier pairs. Is used to set up the shared dependencies including their version requirements.
 * @returns {Object} - Webpack config partial with instantiated module federation plugins.
 */
function config({ name, remote_entry, filename = "remote.min.js", dependencies = {} }) {
    // Create a JS-variable compatible name and add a prefix.
    const normalized_bundle_name =
        MF_NAME_PREFIX + name.match(/([_$A-Za-z0-9])/g).join("");

    return new ModuleFederationPlugin({
        name: normalized_bundle_name,
        ...(remote_entry && {
            filename: filename,
            exposes: {
                "./main": remote_entry,
            },
        }),
        shared: shared_from_dependencies(dependencies),
    });
}

// Default export
const module_exports = (module.exports = config);

// Named exports
module_exports.config = config;
module_exports.MF_NAME_PREFIX = MF_NAME_PREFIX;
module_exports.shared_from_dependencies = shared_from_dependencies;
