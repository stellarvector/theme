module buildtestsite

go 1.26.2

replace github.com/stellarvector/theme/hugo => ../

replace github.com/stellarvector/theme/core => ../../core

require github.com/stellarvector/theme/hugo v0.0.0-nonexistent

require github.com/stellarvector/theme/core v0.0.0
