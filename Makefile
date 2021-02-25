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
  scp -r _site/* pi@bradyouren.com:~/bradyouren.com/

watch: clean
	${CMD} watch

serve:
	${CMD} build && ${CMD} server
