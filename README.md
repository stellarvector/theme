# Stellar Vector Themes

This repository contains the shared themes for Stellar Vector sites.

- `./hugo`: Hugo theme module. Used by `stellarvector.be`, `blog.stellarvector.be`, and `find.stellarvector.be`.
- `./ctfd`: CTFd theme. Used by `play.stellarvector.be`.

## Usage

### Hugo
Add the following to your `hugo.yml`:
```yaml
module:
  imports:
    - path: github.com/stellarvector/theme/hugo
```

For local development (when the theme is unpushed or you want to see live changes), add the following to your site's `go.mod`:
```go
replace github.com/stellarvector/theme/hugo => ../theme/hugo
replace github.com/stellarvector/theme/core => ../theme/core
```
(Adjust the relative paths based on your site's location relative to this repo).

### CTFd
Symlink the `ctfd` directory to your CTFd `themes` directory:
```bash
ln -s /path/to/theme/ctfd /path/to/ctfd/themes/sv
```
Then select the `sv` theme in the CTFd admin panel.
