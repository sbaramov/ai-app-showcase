package app

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.shell.command.annotation.EnableCommand

@SpringBootApplication
@EnableCommand
class TavilySearchCliApplication

fun main(args: Array<String>) {
    runApplication<TavilySearchCliApplication>(*args)
}
