all: deploy

CMD=stack exec -- brdyorn

stack-build:
	stack build

clean:
	${CMD} clean

build:
	${CMD} build

deploy:
	cp -r _site/* ../tippenein.github.io/

watch: clean
	${CMD} watch

serve:
	${CMD} serve
