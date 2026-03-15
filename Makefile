.PHONY: build dev clean

# Build the site using Eleventy
build:
	npm run build

# Serve the site using Eleventy's built-in server with live reload and compile LESS
dev:
	npm run watch

# Clean built files
clean:
	rm -rf docs/*
