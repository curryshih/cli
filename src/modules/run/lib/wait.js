module.exports = async function wait(sec) {
	return new Promise((resolve) => {
		setTimeout(() => resolve(), sec * 1000);
	});
};
