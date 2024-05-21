
export function click_outside_handler(node: any) {
	
	const handleClick = (event: any) => {

		if (node && !node.contains(event.target) && !event.defaultPrevented) {
			node.dispatchEvent(
				new CustomEvent('click_outside', node)
			)
		}

	}

	document.addEventListener('click', handleClick, true);
	
	return {

		destroy() {
			document.removeEventListener('click', handleClick, true);
		}

	}

}