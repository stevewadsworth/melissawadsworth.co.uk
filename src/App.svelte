<script>
import Events from './events/Events.svelte';
import ContactDetails from './ContactDetails.svelte';
import About from './About.svelte';
import Gallery from './Gallery.svelte';
import Footer from './Footer.svelte';
import Header from './Header.svelte';
import Fetch from './Fetch.svelte';
</script>

<style>
.flexContainer {
  position: relative;
  /* Set the max width for the content */
  margin: 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.mainContent {
  position: relative;
  flex: 1 0 auto;
}

.mainContent section {
  max-width: 750px;
  margin: auto;
  display: block;
  margin-top: 4rem;
  margin-bottom: 4rem;
}
</style>

<div class='flexContainer'>
    <Header/>
    <div class='mainContent'>
        <section>
            <About/>
        </section>
        <section>
            <Gallery url={'images/images.json'}/>
        </section>
        <section>
            <Events url={'events.json'}/>
        </section>
        <section>
            <ContactDetails/>
        </section>
    </div>
    <Footer/>
</div>
