# Setup

How to set up this blog locally. The toolchain is managed with [pixi](https://pixi.sh), so you don't need to install Ruby or Node yourself.

## Prerequisites

- [pixi](https://pixi.sh/latest/#installation)
- git

## Blog (Jekyll)

```bash
git clone git@github.com:srivatsamr/srivatsamr-blog.git
cd srivatsamr-blog

pixi run -e blog setup           # one-time: installs bundler, jekyll and gems
pixi run -e blog serve           # http://localhost:4000
pixi run -e blog serve-drafts    # same, but also renders _drafts/
```

The site rebuilds on file changes. Changes to `_config.yml` need a restart.

## Code for posts (`_mycode/`)

Python environment for the scripts and plots that accompany posts:

```bash
pixi run -e mycode python _mycode/<script>.py
pixi run -e mycode jupyter lab
```

## Formatting

Pre-commit runs prettier, the same check CI uses. Run `npm ci` once before first use, then:

```bash
pixi run -e blog pre-commit install
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages. The custom domain is set in `CNAME`.
