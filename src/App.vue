<template>
    <div id="main" class="main">
        jamescain
        <page></page>
        <page2></page2>
    </div>
</template>

<script>
export default {
    components: {
        page: () => import(/* webpackChunkName: "page" */ '@/views/page'),
        page2: () => import(/* webpackChunkName: "page2" */ '@/views/page2')
    }
}
</script>
