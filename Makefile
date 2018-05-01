all: deploy

CMD=stack exec -- brdyorn

stack-build:
	stack build

clean:
	${CMD} clean

build:
	${CMD} build

deploy:
	stack build
	${CMD} clean
	${CMD} build
	cp -r _site/* ../tippenein.github.io/

watch: clean
	${CMD} watch

serve:
	${CMD} build && ${CMD} server
