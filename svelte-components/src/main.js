import Events from './events/Events.svelte';
import ContactDetails from './ContactDetails.svelte';
import About from './About.svelte';
import Gallery from './Gallery.svelte';

new Events({
	target: document.querySelector('#exhibitions'),
	props: {
		apiURL: "events.json"
	}
})

new ContactDetails({
	target: document.querySelector('#contact')
})

new About({
	target: document.querySelector('#about')
})

new Gallery({
	target: document.querySelector('#gallery')
})