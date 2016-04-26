package utils

import (
    "fmt"
    "log"
)

type ContextLogger struct {
    Name string
}

func (self ContextLogger) Debug(template string, params ...interface{}) {
    write(self, "DEBUG", template, params...)
}

func (self ContextLogger) DebugBordered(template string, params ...interface{}) {
    border := "--------------------------------------------------------------------------------"
    write(self, "DEBUG", fmt.Sprintf("\n%s\n%s\n%s", border, template, border), params...)
}

func (self ContextLogger) Error(template string, params ...interface{}) {
    write(self, "ERROR", template, params...)
}

func (self ContextLogger) Info(template string, params ...interface{}) {
    write(self, "INFO", template, params...)
}

func (self ContextLogger) Warn(template string, params ...interface{}) {
    write(self, "WARN", template, params...)
}

func write(contextLogger ContextLogger, level, template string, params ...interface{}) {
    log.Output(3, fmt.Sprintf("%s: %-5s - %s", contextLogger.Name, level, fmt.Sprintf(template, params...)))
}
