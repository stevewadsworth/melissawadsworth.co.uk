<script>
    import { onMount } from "svelte";
    import Location from "./Location.svelte";

    export let apiURL;

    let events = [];
    let data = {
        title: "",
        description: "",
        events: []
    };

    onMount(async function() {
        const response = await fetch(apiURL);
        data = await response.json();
        events = data.events;
    });
</script>

<h2>{data.title}</h2>
<p>{data.description}</p>
<ul>
    {#each events as item }
        <li>
            <span class="exhibitionsDate">
                <p>{item.start}<br>{item.end}</p>
            </span>
            <span class="exhibitionsDescription">
                <h3>
                    {#if item.url}
                        <a href={item.url}>{item.title}</a>
                    {:else}
                        {item.title}
                    {/if}
                </h3>
                <p>{item.description}</p>
                <Location location={item.location}/>
            </span>
        </li>
    {/each}
</ul>

<style>
ul {
  position: relative;
  text-align: start;
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

li {
    border-top: 1px solid #ddd;
    padding: 0.5rem;
}

@media screen and (min-width: 750px) {
    li {
        display: flex;
        flex-direction: row;
    }

    .exhibitionsDate {
        flex-basis: 25%;
        display: block;
        margin: 0 1rem auto auto;
    }

    .exhibitionsDate > p {
        margin: 0;
        padding: 0;
        text-align: right;
    }

    .exhibitionsDescription {
        flex-basis: 75%;
    }

    .exhibitionsDescription > h3 {
        font-size: 1rem;
        margin: 0;
    }

    .exhibitionsDescription > p {
        font-size: 0.8rem;
        margin: 0.5rem 0;
        text-align: left;
    }
}

@media screen and (max-width: 750px) {
  .exhibitionsDescription > h3 {
    font-size: 1rem;
    margin: 1rem;
  }

  .exhibitionsDescription > p {
    font-size: 0.8rem;
    text-align: left;
  }
}
</style>