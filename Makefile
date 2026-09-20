.PHONY: build dev run-dev clean

# Page opened by run-dev (override: make run-dev URL=http://localhost:8080/photos/)
URL ?= http://localhost:8080/videos/
OPEN ?= $(shell command -v xdg-open 2>/dev/null || command -v open 2>/dev/null)

# Build the site using Eleventy
build:
	npm run build

# Serve the site using Eleventy's built-in server with live reload and compile LESS
dev:
	npm run watch

# Compile LESS, serve the site on :8080 and open it in the browser once the server is up
run-dev:
	npm run less:build
	@if [ -n "$(OPEN)" ]; then \
		(for i in $$(seq 1 40); do curl -s -o /dev/null $(URL) && break; sleep 0.5; done; $(OPEN) $(URL) >/dev/null 2>&1) & \
	else echo "No xdg-open/open found, open $(URL) manually"; fi
	npm run watch

# Clean built files
clean:
	rm -rf docs/*
