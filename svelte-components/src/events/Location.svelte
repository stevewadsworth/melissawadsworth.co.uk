<script>
    export let location = "";

    let encodedLoc = encodeURI(location);
</script>

<p><i class="fas fa-map-marker-alt"></i> <a href="https://www.google.com/maps/search/?api=1&query={encodedLoc}">{location}</a></p>
