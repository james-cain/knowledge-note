<template>
    <div>
        test2
        child: <page></page>
    </div>
</template>

<script>
export default {
    components: {
        page: () => import(/* webpackChunkName: "page" */ '@/views/page')
    }
}
</script>

