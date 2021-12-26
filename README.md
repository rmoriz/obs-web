# NOTES REGARDING THIS REPO/FORK

This is a fork of niek's great obs-web repository mainly to enhance deep linking/bookmarking with username and password due to various reloading issues on mobile devices.
Yes, this is insecure on shared devices and human readable passwords may appear in browser history etc. - use with care/incognito mode!

See:

- https://github.com/Niek/obs-web/issues/69
- https://github.com/Niek/obs-web/issues/70
- https://github.com/Niek/obs-web/issues/71

**Breaking Change: Upstream's deep linking is not supported anymore!**

new format:

```

http://localhost:5000/#host=10.0.0.10:4444&password=Joshua

# localhost:5000 => instance of obs-web
# 10.0.0.10 => IP of OBS node
# 4444 => obs-websocket port
# Joshua => obs-websocket password

```

Have a look at the commits at https://github.com/rmoriz/obs-web/commits/master for more details.

[compare this fork with upstream](https://github.com/Niek/obs-web/compare/master...rmoriz:master)


##### Docker images built with github actions:

- **rmoriz/obs-web:latest** (see https://hub.docker.com/r/rmoriz/obs-web/tags)
- **ghcr.io/rmoriz/obs-web:latest** (see https://ghcr.io/rmoriz/obs-web:latest)

```shell
docker run --rm -p 5000:5000 -it rmoriz/obs-web:latest
```

##### Hosted on GitHub Pages

http://obs.rolandrides.com/

(if this link does not work for you, HSTS preloading for subdomains is still active, I'm sorry.)

Thanks,
Roland#2543

(unchanged upstream readme follows:)

# OBS-web

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-9-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

#### The easiest way to control [OBS](https://obsproject.com/) remotely

### **URL: http://obs-web.niek.tv/**

###### Download latest build [here](https://github.com/Niek/obs-web/archive/gh-pages.zip)

---

#### Screenshot:

![Screenshot of OBS-web](.github/screenshot.png)

#### Features:

- No installation needed, works in any modern browser (desktop + mobile)
- Support for remote control through [WSS tunnels](https://github.com/Palakis/obs-websocket/blob/4.x-current/SSL-TUNNELLING.md)
- Easily switch scenes and start/stop streaming and recording
- Support for Studio Mode (preview and program scenes)
- Preview of output, updating continuously
- Fullscreen button and wakelock support
- Easy bookmarking/deeplink by specifying host in URL
- Hide scenes that have `(hidden)` in their name

---

#### Requirements:

- [OBS](https://obsproject.com/)
- [OBS-websocket](https://github.com/Palakis/obs-websocket/releases) plugin
- A tunnel service if you want to control remotely, [see these instructions](https://github.com/Palakis/obs-websocket/blob/4.x-current/SSL-TUNNELLING.md)

---

#### Build instructions:

```bash
npm i
npm run dev # or: npm run build
```

#### Docker:

```bash
docker run --rm -p5000:5000 ghcr.io/niek/obs-web
```

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/verstaerker-583"><img src="https://avatars2.githubusercontent.com/u/40574338?v=4?s=100" width="100px;" alt=""/><br /><sub><b>verstaerker-583</b></sub></a><br /><a href="https://github.com/Niek/obs-web/commits?author=verstaerker-583" title="Code">💻</a></td>
    <td align="center"><a href="http://crazy4groovy.blogspot.ca"><img src="https://avatars0.githubusercontent.com/u/1110812?v=4?s=100" width="100px;" alt=""/><br /><sub><b>crazy4groovy</b></sub></a><br /><a href="https://github.com/Niek/obs-web/issues?q=author%3Acrazy4groovy" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/isctylr"><img src="https://avatars0.githubusercontent.com/u/24595776?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Isaac Taylor</b></sub></a><br /><a href="https://github.com/Niek/obs-web/commits?author=isctylr" title="Code">💻</a> <a href="#ideas-isctylr" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/darthclide"><img src="https://avatars1.githubusercontent.com/u/46735828?v=4?s=100" width="100px;" alt=""/><br /><sub><b>darthclide</b></sub></a><br /><a href="https://github.com/Niek/obs-web/issues?q=author%3Adarthclide" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://blog.rodrigograca.com/"><img src="https://avatars2.githubusercontent.com/u/1134310?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rodrigo Graça</b></sub></a><br /><a href="https://github.com/Niek/obs-web/commits?author=rodrigograca31" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/feitosa-daniel"><img src="https://avatars2.githubusercontent.com/u/1847734?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Daniel Feitosa</b></sub></a><br /><a href="https://github.com/Niek/obs-web/commits?author=feitosa-daniel" title="Code">💻</a></td>
    <td align="center"><a href="http://linkedin.com/in/arun-woosaree"><img src="https://avatars1.githubusercontent.com/u/8227297?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Arun Woosaree</b></sub></a><br /><a href="https://github.com/Niek/obs-web/commits?author=Arunscape" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://avil13.com"><img src="https://avatars3.githubusercontent.com/u/1606172?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Aleksey Pivkin</b></sub></a><br /><a href="https://github.com/Niek/obs-web/commits?author=avil13" title="Code">💻</a> <a href="#ideas-avil13" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="http://www.nathaneaston.com/"><img src="https://avatars.githubusercontent.com/u/10368650?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nathan Easton</b></sub></a><br /><a href="https://github.com/Niek/obs-web/commits?author=ndragon798" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
