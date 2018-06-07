const delimiterMap = {
	init: ['.', '['],
	trans: {
		'.': ['.', '['],
		'[': [']'],
		']': ['.', '['],
	},
};

const pushBuf = (buf, arr) => {
	if (buf === '') return;
	const bint = parseInt(buf, 10);
	if (bint.toString() === buf) {
		arr.push(bint);
		return;
	}
	arr.push(buf);
};

const parseRecur = (chars, buf, delimiters, res) => {
	if (chars.length === 0) {
		pushBuf(buf, res);
		return res;
	}
	const c = chars.shift();
	if (delimiters.indexOf(c) >= 0) {
		pushBuf(buf, res);
		return parseRecur(chars, '', delimiterMap.trans[c], res);
	}
	return parseRecur(chars, `${buf}${c}`, delimiters, res);
};

module.exports = {
	parseKey(key) {
		if (!key) return [];
		const chars = key.split('');
		return parseRecur(chars, '', delimiterMap.init, []);
	},
};
