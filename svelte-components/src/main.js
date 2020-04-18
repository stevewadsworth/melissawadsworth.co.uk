import HelloWorld from './HelloWorld.svelte';
import Events from './events/Events.svelte';

new HelloWorld({
  target: document.querySelector('#hello-world-container')
});

new Events({
	target: document.querySelector('#exhibitions'),
	props: {
		apiURL: "events.json"
	}
})