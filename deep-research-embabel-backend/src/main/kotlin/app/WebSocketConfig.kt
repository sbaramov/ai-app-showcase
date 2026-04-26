package app

import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Configuration
import org.springframework.messaging.simp.config.MessageBrokerRegistry
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker
import org.springframework.web.socket.config.annotation.StompEndpointRegistry
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer

@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig(private val appProperties: AppProperties) : WebSocketMessageBrokerConfigurer {
    override fun configureMessageBroker(registry: MessageBrokerRegistry) {
        // prefix for messages from server to client
        registry.enableSimpleBroker("/topic")
        // prefix for messages from client to server
        registry.setApplicationDestinationPrefixes("/app")
    }

    override fun registerStompEndpoints(registry: StompEndpointRegistry) {
        // register the endpoint where the client connects (raw WebSocket, no SockJS)
        registry.addEndpoint("/ws-research")
            .setAllowedOriginPatterns(*appProperties.allowedOriginPatterns.toTypedArray())

        log.info("WebSockets configured with allowed origin patterns: ${appProperties.allowedOriginPatterns}")
    }

    companion object {
        private val log = LoggerFactory.getLogger(WebSocketConfig::class.java)
    }
}