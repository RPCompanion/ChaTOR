<script lang="ts">

    import { SvelteToast } from '@zerodevx/svelte-toast';
    import { Router, createRouter } from '@roxi/routify'
    import routes from '../.routify/routes.default.js'

    export const router = createRouter({ routes })

</script>

<main>
    <SvelteToast/>
    <Router {router}/>
</main>