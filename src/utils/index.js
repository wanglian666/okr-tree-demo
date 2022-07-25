// 处理为树形结构数据
export function array2tree(data) {
	let result = []
	if (!Array.isArray(data)) {
		return result
	}
	data.forEach(item => {
		delete item.children;
	});
	let map = {};
	data.forEach(item => {
		map[item.id] = item;
	});
	data.forEach(item => {
		let parent = map[item.pid];
		if (parent) {
			(parent.children || (parent.children = [])).push(item);
			parent.expand = false
		} else {
			result.push(item);
		}
	});
	return result;
}

// 处理当前层数和子级总数
// currentLayerNum 当前层数
// subNum  子级数量
export function getNumCurrentLayer(data, parent, currentLayerNum = 1) {
	if (!data || data.length == 0) {
		parent.subNum = 0;
		return [0, []];
	}
	// 子级数量
	let subNum = data.length;
	let subIds = data.map(v => v.id);

	data.forEach(v => {
		// 继续查子节点
		const [subNumRet, subIdsRet] = getNumCurrentLayer(v.children, v, currentLayerNum + 1);
		// 累加
		subNum += subNumRet;
		subIds.push(...subIdsRet);

		// 第一层没有父节点
		if (parent) {
			parent.subNum = subNum;
			parent.subIds = subIds;
		}
		v.currentLayerNum = currentLayerNum;
	});

	return [subNum, subIds];
}


// 处理子级层数
export function getSubLayerNum(arr) {
	const _map = tree2map(arr);

	function temp(arr) {
		if (!arr || arr.length == 0) {
			return;
		}
		arr.forEach(v => {
			if (v.subIds) {
				// 最大层数
				const subMaxLayerNum = Math.max(...v.subIds.map(id => _map[id].currentLayerNum));
				// 子级层数
				v.subLayerNum = subMaxLayerNum - v.currentLayerNum
			} else {
				v.subLayerNum = 0;
			}
			temp(v.children);
		});
	}
	temp(arr);

	return _map;
}


// 数据字典
function tree2map(arr, map = {}) {
	if (!arr || arr.length == 0) {
		return map;
	}

	return arr.reduce((map, item) => {
		map[item.id] = item;
		map = {
			...map,
			...tree2map(item.children)
		}
		return map;
	}, map);
}