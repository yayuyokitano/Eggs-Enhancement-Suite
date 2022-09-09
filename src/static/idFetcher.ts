interface customWindow extends Window {
  member_id: string;
}
declare const window: customWindow;

async function idExists() {
	return new Promise((resolve) => {
		const interval = setInterval(() => {
			if (window.member_id) {
				clearInterval(interval);
				resolve(window.member_id);
			}
		}, 1);
	});
}

idExists().then((id) => {
	window.postMessage({
		type: "memberId",
		data: id
	}, "*");
});
export {};