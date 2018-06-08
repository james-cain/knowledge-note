import Vue from 'vue'
import 'highlight.js/styles/atom-one-light.css'
import App from './App'

// async function getApp () {
//     const V = await import(/* webpackChunkName: "vue" */ 'vue')
//     new V({
//         el: '#app',
//         ...App
//     })
// }
// getApp()

// getApp().then(V => {
//     new V({
//         el: '#app',
//         ...App
//     })
// })
/* eslint no-new: 0 */
/* eslint indent: 0 */
new Vue({
    el: '#app',
    ...App
})
