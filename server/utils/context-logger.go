package utils

import (
	"flag"
	"fmt"
	"log"
	"os"
)

type ContextLogger struct {
	Name string
}

var debug bool

func init() {
	flag.BoolVar(&debug, "debug", false, "Enables debugging log messages")
	log.SetFlags(log.Lshortfile)
	log.SetOutput(os.Stdout)
}

func (c ContextLogger) Debug(template string, params ...interface{}) {
	if !debug {
		return
	}
	write(c, "debug", template, params...)
}

func (c ContextLogger) Error(template string, params ...interface{}) {
	write(c, "error", template, params...)
}

func (c ContextLogger) Info(template string, params ...interface{}) {
	write(c, "info", template, params...)
}

func (c ContextLogger) Warn(template string, params ...interface{}) {
	write(c, "warn", template, params...)
}

func write(contextLogger ContextLogger, level, template string, params ...interface{}) {
	log.Output(3, fmt.Sprintf("(%s:) %-5s - %s", contextLogger.Name, level, fmt.Sprintf(template, params...)))
}
