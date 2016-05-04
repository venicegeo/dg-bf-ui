package logger

import (
	"flag"
	"fmt"
	"log"
	"os"
	"path"
	"runtime"
)

type logger struct {
	context string
}

var debug = flag.Bool("debug", true, "Enable verbose logging")

func init() {
	log.SetFlags(log.Lshortfile)
	log.SetOutput(os.Stdout)
}

func New() *logger {
	pc, _, _, _ := runtime.Caller(1)
	canonicalName := runtime.FuncForPC(pc).Name()
	return &logger{context: path.Ext(path.Base(canonicalName))}
}

func (l logger) Debug(template string, params ...interface{}) {
	if !*debug {
		return
	}
	l.print("Debug", template, params...)
}

func (l logger) Error(template string, params ...interface{}) {
	l.print("Error", template, params...)
}

func (l logger) Info(template string, params ...interface{}) {
	l.print("Info", template, params...)
}

func (l logger) Warn(template string, params ...interface{}) {
	l.print("Warn", template, params...)
}

func (l logger) print(level, template string, params ...interface{}) {
	log.Output(3, fmt.Sprintf("(%14s) - %-5s - %s", l.context, level, fmt.Sprintf(template, params...)))
}
