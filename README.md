# srivatsamr-blog

Source for my personal blog at [www.srivatsamr.com](https://www.srivatsamr.com/).

Built with [Jekyll](https://jekyllrb.com/) on top of the [al-folio](https://github.com/alshedivat/al-folio) theme (MIT licensed) and deployed to GitHub Pages.

## Layout

| Path          | Contents                               |
| ------------- | -------------------------------------- |
| `_posts/`     | Published posts                        |
| `_drafts/`    | Work-in-progress posts                 |
| `_pages/`     | Static pages (about, blog index, etc.) |
| `_mycode/`    | Code and plots that accompany posts    |
| `assets/`     | Images, JS, CSS and other static files |
| `_config.yml` | Site configuration                     |

## Local development

The toolchain is managed with [pixi](https://pixi.sh):

```bash
pixi run -e blog setup           # one-time: install bundler, jekyll and gems
pixi run -e blog serve           # serve at http://localhost:4000
pixi run -e blog serve-drafts    # same, including _drafts/
```

## Deployment

Pushing to `main` triggers the GitHub Actions workflow in `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages.

## License

The theme is MIT licensed; see [LICENSE](LICENSE). Post content is © Srivatsa.
