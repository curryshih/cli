module.exports = async (argv, tools) => {
	const manifests = await tools.findProjects();
	Object.keys(manifests).forEach((pjn) => {
		tools.log.ln(`  ${pjn.yellow} located at ${manifests[pjn].rootDir}`);
	});
};
