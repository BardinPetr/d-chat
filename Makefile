VERSION := $(shell jq .version -r < package.json)
TARGET := web-ext-artifacts/sources-$(VERSION).zip

.PHONY: all source

all : source

source:
	zip -r $(TARGET) src scripts public config package-lock.json package.json README.md .eslintrc.js .env .babelrc .gitmodules
