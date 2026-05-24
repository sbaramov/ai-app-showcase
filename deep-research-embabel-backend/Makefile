clean:
	mvn clean
test:
	mvn verify
run:
	mvn spring-boot:run
run-cloud:
	mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dembabel.models.default-llm=gemma4:31b-cloud"
run-mock:
	mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.profiles.active=local,mock"run-mock:
run-gemma4:
	mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.profiles.active=local,gemma4"
run-qwen35:
	mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.profiles.active=local,qwen3.5"
run-deepseek:
	mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.profiles.active=local,deepseek"
