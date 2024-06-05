
export function click_outside_handler(node: HTMLElement, callback: () => void) {
	
	const handleClick = (event: any) => {

		if (node && !node.contains(event.target) && !event.defaultPrevented) {
			callback();
		}

	}

	document.addEventListener('click', handleClick, true);
	return {

		destroy() {
			document.removeEventListener('click', handleClick, true);
		}

	}

}