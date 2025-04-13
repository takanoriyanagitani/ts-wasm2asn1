#!/bin/sh

find \
	. \
	-type f \
	-name '*.ts' |
	xargs deno lint
