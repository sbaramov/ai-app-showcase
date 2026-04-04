package app

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class DeepSearchApplication

fun main(args: Array<String>) {
    runApplication<DeepSearchApplication>(*args)
}
