VERSION := $(shell jq .version -r < package.json)
TARGET := web-ext-artifacts/sources-$(VERSION)

.PHONY: all source

all : source

source:
	zip -r $(TARGET).zip src scripts public config package-lock.json package.json README.md .eslintrc.js .env .babelrc .gitmodules
	@echo DONE
	npm --version
	node --version
	lsb_release -a
