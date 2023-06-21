let config = {
	...require("@allindevelopers/prettier-config"),
	plugins: [],
};

if (process.env.GIT_HOOKS) {
	config.plugins.push(require("prettier-plugin-tailwindcss"));
}

module.exports = config;
