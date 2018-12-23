module.exports = {
  title: 'Jamescain Blog',
  description: 'A knowledge blog',
  base: '/My-lab/',
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: '/favicon.ico'
      }
    ]
  ],
  themeConfig: {
    repo: 'james-cain/My-lab',
    editLinkText: '在GitHub上编辑此页',
    nav: [
      {
        text: '知识库',
        link: '/knowledge/'
      },
      {
        text: '其他',
        items: [
          {
            text: '作者twitter',
            link: 'https://twitter.com/Jamescain_lll'
          }
        ]
      }
    ],
    sidebar: {
      '/knowledge/': [
        {
          title: '基础',
          collapsable: false,
          children: [
            '/knowledge/Damn-hole-of-html5.md',
            '/knowledge/Damn-hole-of-CSS3.md',
            '/knowledge/Damn-hole-of-javascript.md',
            '/knowledge/review-the-javascript.md',
            '/knowledge/Damn-hole-of-interview.md',
            '/knowledge/Damn-hole-of-design-patterns.md',
            '/knowledge/Damn-hole-of-http.md'
          ]
        },
        {
          title: '进阶',
          collapsable: false,
          children: [
            '/knowledge/Damn-hole-of-common-plugin.md',
            '/knowledge/Damn-hole-of-webapi.md',
            '/knowledge/Damn-hole-of-Browser.md',
            '/knowledge/Damn-hole-of-IE9.md',
            '/knowledge/Damn-hole-of-mobile-compatibility.md',
            '/knowledge/Damn-hole-of-google-devtools.md',
            '/knowledge/Damn-hole-of-network.md',
            '/knowledge/Damn-hole-of-safe-and-hacker.md',
            '/knowledge/Damn-hole-of-javascript-algonithms.md',
            '/knowledge/Damn-hole-of-performance.md',
            '/knowledge/parameters-of-package.md'
          ]
        },
        {
          title: '工具',
          collapsable: false,
          children: [
            '/knowledge/Damn-hole-of-babel.md',
            '/knowledge/webpack-perf.md',
            '/knowledge/webpack-source-learning.md',
            '/knowledge/how-to-use-npm-sonatype.md'
          ]
        },
        {
          title: '拓展',
          collapsable: false,
          children: [
            '/knowledge/Damn-hole-of-pwa.md'
          ]
        },
        {
          title: '源码分析',
          collapsable: false,
          children: [
            '/knowledge/Damn-hole-of-mvvm.md',
            '/knowledge/Damn-hole-of-React.md',
            '/knowledge/Damn-hole-of-Vue.md'
          ]
        },
        {
          title: '其他',
          collapsable: false,
          children: [
            '/knowledge/server-record.md'
          ]
        }
      ]
    }
  }
}