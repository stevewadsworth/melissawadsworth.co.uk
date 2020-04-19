<script>
    export let location = "";

    let encodedLoc = encodeURI(location);
</script>

<p><i class="fas fa-map-marker-alt"></i> <a href="https://www.google.com/maps/search/?api=1&query={encodedLoc}">{location}</a></p>

<style>
p {
    font-size: 0.8rem;
    text-align: left;
}
@media screen and (min-width: 750px) {
    p {
        margin: 0.5rem 0;
    }
}

</style>