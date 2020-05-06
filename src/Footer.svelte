<script>
    import { onMount } from "svelte";

    let year;
        onMount(async function() {
            year = (new Date()).getFullYear();
        });
</script>

<style>
.siteFooter {
  flex: 0 0 auto;
  position: relative;
  bottom: 0;
  width: 100%;
  height: auto;
  font-size: 0.75rem;
  margin-top: 3rem;
}

p {
  text-align: center;
  margin: 1rem;
}

@media screen and (min-width: 750px) {
  .siteFooter > hr {
    border: 0;
    height: 1px;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
  }
}

</style>

<footer class="siteFooter">
    <hr/>
    <p>
    <i class="fas fa-phone"></i>
    <a href="tel:+447966417196">+44 (0) 7966 417196</a> -
    <i class="fas fa-envelope"></i>
    <a href="mailto:info@melissawadsworth.co.uk">info@melissawadsworth.co.uk</a> -
    <i class="fab fa-instagram"></i>
    <a href="https://www.instagram.com/melissa_wadsworth_artist/">melissa_wadsworth_artist</a>
    </p>
    <p><i class="far fa-copyright"></i> {year} Melissa Wadsworth. All rights reserved.</p>
</footer>
