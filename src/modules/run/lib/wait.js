module.exports = async function wait(msec) {
	return new Promise((resolve) => {
		setTimeout(() => resolve(), msec * 1000);
	});
};
