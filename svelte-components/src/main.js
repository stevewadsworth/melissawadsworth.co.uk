import Events from './events/Events.svelte';

new Events({
	target: document.querySelector('#exhibitions'),
	props: {
		apiURL: "events.json"
	}
})