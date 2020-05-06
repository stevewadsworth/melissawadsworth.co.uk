<script>
    import { onMount } from "svelte";

    export let url;
    let data;

    onMount(async function() {
        const response = await fetch(url);
        data = await response.json();
        console.log(data);
    });
</script>

<div>
    <slot data={data}></slot>
</div>